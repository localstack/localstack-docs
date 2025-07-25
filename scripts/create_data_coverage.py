"""
Script to generate coverage md-files for services, and related data-templates
"""
import csv
import os
import sys
from pathlib import Path
import json
from json import JSONDecodeError
from pathlib import Path
import shutil
from operator import itemgetter

def create_data_templates_for_service(
    target_dir: str, metrics: dict, service: str, delete_if_exists: bool = False
):
    """
    Creates the data-template for a service.
    :param target_dir: the directory where the data-template will be stored
    :param metrics: the collected metrics for the service
    :param service: name of the service
    :param delete_if_exists: checks if the target_dir exists and deletes it before creating new md-files. default: False
    """
    output = {}
    details = metrics.pop("details", {})
    operations = []

    community_support = False
    pro_support = False
    for key, value in metrics.items():
        operations.append({key: value})

        # check if the service supports community and/or pro:
        if not community_support and value.get("availability") == "community":
            community_support = True
        if not pro_support and value.get("availability") == "pro":
            pro_support = True

    output["service"] = service
    if pro_support:
        output["pro_support"] = True
    if community_support:
        output["community_support"] = True

    output["operations"] = operations

    # sort the details
    for op_details, params in details.items():
        # alphabetically by parameters
        details[op_details] = dict(sorted(params.items()))
        for param, test_suites in details[op_details].items():
            # alphabetically by test-suite (ls-community/ls-pro)
            details[op_details][param] = dict(sorted(test_suites.items()))
            for test_suite, test_list in details[op_details][param].items():
                # by test details e.g. first response code then node_id
                details[op_details][param][test_suite] = sorted(
                    test_list, key=itemgetter("response", "node_id")
                )

    # sort alphabetically by operation-name
    output["details"] = dict(sorted(details.items()))

    # write data-template file
    dirpath = Path(target_dir)
    if delete_if_exists:
        if dirpath.exists() and dirpath.is_dir():
            shutil.rmtree(dirpath)

    dirpath.mkdir(parents=True, exist_ok=True)

    file_name = dirpath.joinpath(f"{service}.json")
    with open(file_name, "w") as fd:
        json.dump(output, fd, indent=2)


def main(
    path_to_implementation_details: str,
    path_to_raw_metrics: str,
    target_dir: str,
    service_lookup_details: str = None,
):
    impl_details = {}
    # read the implementation-details for pro + community first and generate a dict
    # with information about all services and operation, and indicator if those are implemented, and available only in pro:
    # {"service_name":
    #   {
    #       "operation_name": {"implemented": True, "pro": False}
    #   }
    # }
    with open(
        f"{path_to_implementation_details}/pro/implementation_coverage_full.csv",
        mode="r",
    ) as file:
        # check pro implementation details first
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            service_name = row["service"]
            if service_name == "sqs-query":
                # we currently have "sqs" + "sqs-query" endpoints because of different protocols
                # the resulting coverage should not care about this though
                continue
            service = impl_details.setdefault(service_name, {})
            service[row["operation"]] = {
                "implemented": True if row["is_implemented"] == "True" else False,
                "pro": True,
            }
    with open(
        f"{path_to_implementation_details}/community/implementation_coverage_full.csv",
        mode="r",
    ) as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            service_name = row["service"]
            if service_name == "sqs-query":
                # we currently have "sqs" + "sqs-query" endpoints because of different protocols
                # the resulting coverage should not care about this though
                continue
            service = impl_details.setdefault(row["service"], {})
            # update all operations that are available in community
            if row["is_implemented"] == "True":
                service.setdefault(row["operation"], {"implemented": True})
                service[row["operation"]]["pro"] = False

    services = sorted(impl_details.keys())

    for service in services:
        # special handling for rds/neptune/docdb: the services "neptune" + "docdb" are recognized as "rds" calls
        check_service = service
        if service in ["neptune", "docdb"]:
            check_service = "rds"

        services_of_interest = [check_service]
        if service == "sqs":
            # also collect all metrics for "sqs-query" and add to the service
            services_of_interest.append("sqs-query")
        
        # now check the actual recorded test data and map the information
        recorded_metrics = aggregate_recorded_raw_data(
            base_dir=path_to_raw_metrics,
            operations=impl_details.get(service),
            services_of_interest=services_of_interest,
        )

        create_data_templates_for_service(
            target_dir + "/data", recorded_metrics, service
        )


def _init_metric_recorder(operations_dict: dict):
    """
    creates the base structure to collect raw data from the service_dict
    :param operations_dict:
    """
    operations = {}

    for operation, details in operations_dict.items():
        availability = "pro" if details["pro"] else "community"

        if not details["implemented"]:
            availability = ""
        op_attributes = {
            "implemented": details["implemented"],
            "availability": availability,
            "internal_test_suite": False,
            "external_test_suite": False,
            "terraform_test_suite": False,
            "aws_validated": False,
            "snapshot_tested": False,
            "snapshot_skipped": "",
        }
        operations[operation] = op_attributes

    return operations


def aggregate_recorded_raw_data(
    base_dir: str, operations: dict, services_of_interest: list[str]
):
    """
    collects all the raw metric data and maps them in a dict with information about the service, and a "details"
    that includes details about any related test.
            {"operation-name":
                {
                "implemented": true,
                "availability": "community",
                "internal_test_suite": false,
                "external_test_suite": true,
                "aws_validated": false,
                "terraform_test_suite": false,
                "snapshot_tested": false,
                "snapshot_skipped": ""
                 },
            ....
            "details":
                {"operation-name":
                    {"parameters": {
                        "ls_community": [
                        {
                            "node_id": "test-node-id",
                            "test": "short-display-name",
                            "response": "200",
                            "error": "",
                            "snapshot_skipped": "",
                            "aws_validated": True,
                            "snapshot_tested: True,
                            "origin": "external"
                         }
                        ],
                        "ls_pro": [...]
                        }
                    }
                }
            }
    :param base_dir: directory where the raw-metrics csv-files are stored
    :param operations: dict
    :param service: service of interest
    :returns: dict with details about invoked operations
    """
    # contains internal + external calls
    recorded_data = _init_metric_recorder(operations)
    pathlist = Path(base_dir).rglob("*.csv")
    for path in pathlist:
        test_source = path.stem
        # print(f"checking {str(path)}")
        with open(path, "r") as csv_obj:
            csv_dict_reader = csv.DictReader(csv_obj)
            for metric in csv_dict_reader:
                service = metric.get("service")
                if service not in services_of_interest:
                    continue
                
                node_id = metric.get("node_id") or metric.get("test_node_id")
                if not node_id:
                    # some records do not have a node-id -> relates to requests in the background between tests
                    continue

                # skip tests are marked as xfail
                if str(metric.get("xfail", "")).lower() == "true":
                    continue

                op_name = metric.get("operation")
                op_record = recorded_data.get(op_name)
                if not op_record:
                    # some operations are only "phantoms" (e.g. s3.PostObject)
                    # and for docdb/neptune not all rds operations are available either -> we skip in that case
                    #print(
                    #    f"---> operation {metric.get('service')}.{metric.get('operation')} was not found"
                    #)
                    continue

                internal_test = False
                external_test = False

                if test_source.startswith("community"):
                    test_node_origin = "LocalStack Community"
                    internal_test = True
                    source = "ls_community"
                elif test_source.startswith("pro"):
                    test_node_origin = "LocalStack Pro"
                    internal_test = True
                    source = "ls_pro"
                else:
                    external_test = True


                if external_test and metric.get("response_code") in ["500", "501"]:
                    # some external tests (e.g seen for terraform) seem to succeed even though single operation calls fail
                    # we do not include those as "passed tests"
                    print(f"skipping {service}.{op_name}: response_code {metric.get('response_code')} ({test_source})")
                    continue 

                terraform_validated = True if test_source.startswith("terraform") else False
                if internal_test and not op_record.get("internal_test_suite"):
                    op_record["internal_test_suite"] = True
                if external_test and not op_record.get("external_test_suite"):
                    op_record["external_test_suite"] = True

                aws_validated = (
                    str(metric.get("aws_validated", "false")).lower() == "true"
                )

                # snapshot_tested is set if the test uses the snapshot-fixture + does not skip everything 
                #   (pytest.marker.skip_snapshot_verify)
                snapshot_tested = (
                    str(metric.get("snapshot", "false")).lower() == "true"
                    and metric.get("snapshot_skipped_paths", "") != "all"
                )

                if snapshot_tested and not aws_validated:
                    # the test did not have the marker aws_validated, but as it is snapshot_tested we can assume aws-validation
                    aws_validated = True

                if not op_record.get("snapshot_tested") and snapshot_tested:
                    op_record["snapshot_tested"] = True
                    op_record["aws_validated"] = True

                if not op_record.get("aws_validated") and aws_validated:
                    op_record["aws_validated"] = True

                if not op_record.get("terraform_test_suite") and terraform_validated:
                    op_record["terraform_test_suite"] = True

                if internal_test and not op_record["implemented"]:
                    print(f"WARN: {service}.{op_name} classified as 'not implemented', but found a test calling it: ({source}) {node_id}")
                    op_record["implemented"] = True
                    op_record["availability"] = "pro" if source == "ls_pro" else "community"
                
                # test details currently only considered for internal test suite
                # TODO might change when we include terraform test results
                if not internal_test:
                    continue
                
                # collect test details
                details = recorded_data.setdefault("details", {})
                # one dict for each operation
                details_tests = details.setdefault(op_name, {})

                # grouped by parameters
                params = metric.get("parameters", "None").split(",")
                params.sort()
                parameters = ", ".join(params)
                if not parameters:
                    parameters = "- (without any parameters)"
                
                param_test_details = details_tests.setdefault(parameters, {})

                # separate lists for source ("ls_community" and "ls_pro")
                test_list = param_test_details.setdefault(source, [])

                if param_exception := metric.get("exception", ""):
                    if param_exception == "CommonServiceException":
                        # try to get more details about the CommonServiceException from the response
                        try:
                            data = json.loads(metric.get("response_data", "{}"))
                            param_exception = data.get("__type", param_exception)
                        except JSONDecodeError:
                            # in this case we just keep the original "CommonServiceException" information
                            pass

                # get simple test name (will be shown on coverage page)
                if node_id.endswith("]"):
                    # workaround for tests that have a "::" as part of a parameterized test
                    # e.g. tests/integration/mytest.py::SomeTest::test_and_or_functions[Fn::Or-0-0-False]
                    tmp = node_id[0 : node_id.rfind("[")].split("::")[-1]
                    simple_test_name = tmp + node_id[node_id.rfind("[") :]
                else:
                    simple_test_name = node_id.split("::")[-1]
                test_detail = {
                    "node_id": f"{test_node_origin}: {node_id}",
                    "test": simple_test_name,
                    "response": metric.get("response_code", -1),
                    "error": param_exception,
                    "snapshot_skipped": metric.get("snapshot_skipped_paths", ""),
                    "aws_validated": aws_validated,
                    "snapshot_tested": snapshot_tested,
                    "origin": metric.get("origin", ""),
                }
                if test_detail not in test_list:
                    # avoid duplicates
                    test_list.append(test_detail)

    return recorded_data


def print_usage():
    print("missing arguments")
    print(
        "usage: python create_data_coverage.py <dir-to-implementation-details> <dir-to-raw-csv-metric> <target-dir>"
    )


if __name__ == "__main__":
    import argparse

    argParser = argparse.ArgumentParser()
    argParser.add_argument("-i", "--implementation-details", required=True, help="path to implementation details")
    argParser.add_argument("-r", "--raw-metrics", required=True, help="path to raw metrics")
    argParser.add_argument("-o", "--output-dir", required=True, help="directory where the generated files will be stored")
    argParser.add_argument("-s", "--service-details-json", help="path to service_display_name.json")

    args = argParser.parse_args()

    path_to_implementation_details = args.implementation_details
    path_to_raw_metrics = sys.argv[2]
    target_dir = sys.argv[3]
    service_lookup_details = None

    if len(sys.argv) == 5:
        # optional parameter, path to service_display_name.json
        service_lookup_details = sys.argv[4]
    main(
        path_to_implementation_details=args.implementation_details,
        path_to_raw_metrics=args.raw_metrics,
        target_dir=args.output_dir,
        service_lookup_details=args.service_details_json,
    )
