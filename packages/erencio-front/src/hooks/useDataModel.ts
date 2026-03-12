import { gql } from '@backoffice/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type ObjectMetadata = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string | null;
  isCustom: boolean;
  isActive: boolean;
  fieldsCount: number;
};

export type UseDataModelReturn = {
  objects: ObjectMetadata[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

// Metadata API: objects query returns all non-system objects (custom + standard CRM objects)
// isSystem=FALSE excludes internal Twenty infrastructure objects
const GET_OBJECTS_QUERY = `
  query GetObjectMetadata {
    objects(filter: { isSystem: { is: FALSE } }) {
      edges {
        node {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          isCustom
          isActive
          fields {
            totalCount
          }
        }
      }
    }
  }
`;

type ObjectNodeRaw = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string | null;
  isCustom: boolean;
  isActive: boolean;
  fields: { totalCount: number };
};

export const useDataModel = (): UseDataModelReturn => {
  const [objects, setObjects] = useState<ObjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    gql<{ objects: { edges: Array<{ node: ObjectNodeRaw }> } }>(GET_OBJECTS_QUERY)
      .then((result) => {
        if (cancelled) return;
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load data model');
          return;
        }
        setObjects(
          (result.data?.objects.edges ?? []).map(({ node }) => ({
            id: node.id,
            nameSingular: node.nameSingular,
            namePlural: node.namePlural,
            labelSingular: node.labelSingular,
            labelPlural: node.labelPlural,
            description: node.description,
            isCustom: node.isCustom,
            isActive: node.isActive,
            fieldsCount: node.fields?.totalCount ?? 0,
          })),
        );
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  return { objects, loading, error, refresh };
};
