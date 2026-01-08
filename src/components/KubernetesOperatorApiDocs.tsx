import React from 'react';
import apiDocs from '../content/docs/aws/enterprise/kubernetes-operator-api-docs.json';

interface TypeDef {
  uid: string;
  name: string;
  package: string;
  doc: string;
  default: string;
  validation: string[];
  markers: Record<string, any>;
  kind: string;
  fields: FieldDef[];
}

interface FieldDef {
  Name: string;
  Doc: string;
  Type: TypeInfo;
  Validation?: string[];
  Markers?: Record<string, any>;
}

interface TypeInfo {
  uid: string;
  name: string;
  package: string;
  kind: string;
  underlyingType?: TypeInfo;
}

const DocsGroup = apiDocs[0];
const Types = DocsGroup.Types as Record<string, TypeDef>;
const CurrentPackage = Types['LocalStack']?.package || '';

const isRequired = (field: FieldDef) => {
  const isOptionalMarker = field.Markers?.['kubebuilder:validation:Optional'];
  const isOptionalValidation = field.Validation?.some(v => v.includes('Optional'));
  return !(isOptionalMarker || isOptionalValidation);
};

const renderTypeName = (typeInfo: TypeInfo) => {
  let name = typeInfo.name;
  let pkg = typeInfo.package;
  
  if (typeInfo.kind === 'POINTER' && typeInfo.underlyingType) {
    name = typeInfo.underlyingType.name;
    pkg = typeInfo.underlyingType.package;
  } else if (typeInfo.kind === 'SLICE' && typeInfo.underlyingType) {
    name = `[]${typeInfo.underlyingType.name}`;
    pkg = typeInfo.underlyingType.package;
  } else if (typeInfo.kind === 'MAP' && typeInfo.underlyingType) {
      // Simplification for maps if needed, though keyType/valueType logic would be better if available
      // But looking at snippet, `underlyingType` might be the value type? 
      // Let's stick to simple name if possible or just `name` from top level.
      // The `name` field in top level TypeInfo often contains the full string e.g. "string" or "CaCertificateConfigMap"
  }

  // If the name is generic "map[string]..." or similar, we might need to rely on the name property.
  if (!name) name = typeInfo.name;

  // Clean up name if it's full path (unlikely based on snippet)
  // Check if we should link
  if (pkg === CurrentPackage && Types[name]) {
    return <a href={`#${name.toLowerCase()}`}>{name}</a>;
  }
  
  return <span>{name}</span>;
};

export default function KubernetesOperatorApiDocs() {
  // Sort keys: LocalStack first, then others alphabetically
  const sortedKeys = Object.keys(Types).sort((a, b) => {
    if (a === 'LocalStack') return -1;
    if (b === 'LocalStack') return 1;
    if (a === 'LocalStackSpec') return -1;
    if (b === 'LocalStackSpec') return 1;
    if (a === 'LocalStackStatus') return -1;
    if (b === 'LocalStackStatus') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-8">
      {sortedKeys.map((key) => {
        const typeDef = Types[key];
        return (
          <div key={key} className="flex flex-col gap-4">
            <h3 id={key.toLowerCase()} className="text-xl font-bold">{key}</h3>
            <p className="whitespace-pre-wrap">{typeDef.doc}</p>
            {typeDef.fields && typeDef.fields.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="p-3 border-b font-semibold whitespace-nowrap">Name</th>
                      <th className="p-3 border-b font-semibold whitespace-nowrap">Type</th>
                      <th className="p-3 border-b font-semibold w-full">Description</th>
                      <th className="p-3 border-b font-semibold whitespace-nowrap w-24">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeDef.fields.map((field) => (
                      <tr key={field.Name} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <td className="p-3 font-mono text-primary-600 dark:text-primary-400 whitespace-nowrap">{field.Name}</td>
                        <td className="p-3 font-mono whitespace-nowrap">{renderTypeName(field.Type)}</td>
                        <td className="p-3">{field.Doc}</td>
                        <td className="p-3 text-center whitespace-nowrap">{isRequired(field) ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
                <p className="italic text-gray-500">No fields defined.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
