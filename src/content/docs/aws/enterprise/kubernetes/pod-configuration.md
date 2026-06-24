---
title: Pod Configuration
description: Configure Kubernetes pods launched by LocalStack services.
template: doc
sidebar:
    order: 6
tags: ["Enterprise"]
---

## Introduction

When LocalStack runs inside Kubernetes with the Kubernetes executor enabled, some services create child pods for workloads such as Lambda invocations and ECS tasks.
In heterogeneous clusters, these child pods may need additional Kubernetes configuration so they are scheduled onto the right node pools, carry the right resource requests, or integrate with cluster policies.

Use the `LOCALSTACK_K8S_POD_CONFIG` environment variable to configure Kubernetes metadata, scheduling, and resource settings for LocalStack-spawned pods.
The variable accepts a JSON object with reusable `profiles` and optional per-service mappings.
The value must be valid JSON. LocalStack validates this configuration at startup and refuses to start if the value is not valid JSON or contains unknown fields, so misconfigurations surface before any child pods are created.

::::note
This feature currently applies to Lambda and ECS pods created by the Kubernetes executor.
Support for additional service integrations is being added incrementally.
::::

## Supported fields

Each profile can define the following fields:

| Field | Description |
|---|---|
| `tolerations` | Kubernetes tolerations applied to the pod spec |
| `nodeSelector` | Node selector applied to the pod spec |
| `affinity` | Kubernetes affinity configuration applied to the pod spec |
| `topologySpreadConstraints` | Topology spread constraints applied to the pod spec |
| `priorityClassName` | Priority class name applied to the pod spec |
| `resources` | Resource requests and limits applied to every non-init container in the pod |
| `labels` | Labels merged into the pod metadata |
| `annotations` | Annotations merged into the pod metadata |

Scheduling fields such as `nodeSelector`, `tolerations`, and `affinity` replace the corresponding values on the generated pod spec.
They are not merged with existing spec values.
Resource settings are applied to the pod's application containers; init containers keep their generated defaults.

## Configure default profiles

The simplest configuration is to define default profiles.
LocalStack uses the architecture-specific defaults for Lambda and ECS when the workload architecture is known, and falls back to `default` otherwise.

```json
{
  "profiles": {
    "default": {
      "nodeSelector": {
        "pool": "general"
      }
    },
    "defaultArm64": {
      "nodeSelector": {
        "pool": "arm-nodes"
      }
    },
    "defaultAmd64": {
      "nodeSelector": {
        "pool": "amd-nodes"
      }
    }
  }
}
```

With this configuration:

- Lambda and ECS ARM workloads use the `defaultArm64` profile.
- Lambda and ECS x86 workloads use the `defaultAmd64` profile.
- Workloads without architecture information use the `default` profile.

To use this with the Helm chart, pass the JSON as an environment variable in your `values.yaml`:

```yaml
extraEnvVars:
  - name: LOCALSTACK_K8S_POD_CONFIG
    value: |
      {
        "profiles": {
          "default": {
            "nodeSelector": {
              "pool": "general"
            }
          },
          "defaultArm64": {
            "nodeSelector": {
              "pool": "arm-nodes"
            }
          },
          "defaultAmd64": {
            "nodeSelector": {
              "pool": "amd-nodes"
            }
          }
        }
      }
```

If you deploy LocalStack with the [LocalStack Operator](/aws/enterprise/kubernetes/kubernetes-operator/), set the same configuration as structured YAML under `spec.podSchedulingConfig` in your `LocalStack` resource instead of passing JSON:

```yaml
apiVersion: api.localstack.cloud/v1alpha1
kind: LocalStack
spec:
  # other fields
  podSchedulingConfig:
    profiles:
      default:
        nodeSelector:
          pool: general
      defaultArm64:
        nodeSelector:
          pool: arm-nodes
      defaultAmd64:
        nodeSelector:
          pool: amd-nodes
```

## Configure per-service profiles

Use the `services` block when a service needs a dedicated profile.
A service can reference a single profile with `profile`, or it can map `arm64` and `amd64` workloads to different profiles.

```json
{
  "profiles": {
    "default": {
      "nodeSelector": {
        "pool": "general"
      }
    },
    "defaultAmd64": {
      "nodeSelector": {
        "pool": "amd-nodes"
      }
    },
    "lambda-arm": {
      "nodeSelector": {
        "pool": "lambda-arm-nodes"
      },
      "resources": {
        "requests": {
          "cpu": "500m",
          "memory": "512Mi"
        },
        "limits": {
          "cpu": "2",
          "memory": "2Gi"
        }
      }
    },
    "ecs-tasks": {
      "nodeSelector": {
        "pool": "ecs-nodes"
      }
    }
  },
  "services": {
    "lambda": {
      "arm64": "lambda-arm"
    },
    "ecs": {
      "profile": "ecs-tasks"
    }
  }
}
```

In this example, ARM Lambda pods use `lambda-arm`.
AMD64 Lambda pods use `defaultAmd64`.
ECS pods always use `ecs-tasks`, regardless of architecture, because `services.ecs.profile` bypasses architecture-based routing.
Workloads without architecture information use `default`.

## Profile resolution

LocalStack resolves the profile for a child pod in this order:

1. `services.<service>.profile`
2. `services.<service>.arm64` or `services.<service>.amd64`
3. `profiles.defaultArm64` or `profiles.defaultAmd64`
4. `profiles.default`
5. No scheduling, resource, or metadata profile is applied. System labels are still added.

`defaultArm64`, `defaultAmd64`, and `default` are reserved profile names.
Use them only for global defaults.

Architecture values are normalized before lookup.
For example, `ARM64` is treated as `arm64`, and `x86_64` or `X86_64` are treated as `amd64`.
The keys in `LOCALSTACK_K8S_POD_CONFIG` should still be `arm64` and `amd64`.

If a service references a profile that does not exist, LocalStack logs a warning and applies no pod configuration for that request.
It does not silently fall back to `default`.

## Labels and annotations

`labels` and `annotations` in `LOCALSTACK_K8S_POD_CONFIG` are merged into the metadata of the generated child pod.
Profile labels override labels set through `LOCALSTACK_K8S_LABELS`, and profile annotations override annotations set through `LOCALSTACK_K8S_ANNOTATIONS`.

LocalStack also injects the following system labels:

```yaml
app.kubernetes.io/managed-by: localstack
localstack.cloud/service: <service>
```

System labels are applied last and cannot be overridden.
You can use these labels to target LocalStack-spawned pods from Kubernetes tooling such as network policies, admission controllers, or monitoring agents.

## Example with scheduling and metadata

The following example schedules Lambda pods on dedicated nodes, adds tolerations, sets resource limits, and attaches metadata used by platform tooling:

```json
{
  "profiles": {
    "lambda": {
      "nodeSelector": {
        "workload": "localstack-lambda"
      },
      "tolerations": [
        {
          "key": "dedicated",
          "operator": "Equal",
          "value": "localstack",
          "effect": "NoSchedule"
        }
      ],
      "resources": {
        "requests": {
          "cpu": "250m",
          "memory": "256Mi"
        },
        "limits": {
          "cpu": "1",
          "memory": "1Gi"
        }
      },
      "labels": {
        "team": "platform"
      },
      "annotations": {
        "prometheus.io/scrape": "true"
      }
    }
  },
  "services": {
    "lambda": {
      "profile": "lambda"
    }
  }
}
```

## Related configuration

- Use `LOCALSTACK_K8S_NAMESPACE` to choose the namespace for child pods.
- Use `LOCALSTACK_K8S_LABELS` and `LOCALSTACK_K8S_ANNOTATIONS` for simple labels and annotations that apply to all child pods.
- Use `K8S_CONTAINER_SECURITY_CONTEXT` to configure the security context for child pod containers.

For the complete list of Kubernetes executor configuration variables, see the [Kubernetes configuration reference](/aws/enterprise/kubernetes/configuration/).
