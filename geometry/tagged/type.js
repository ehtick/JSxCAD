import { rewrite } from './visit.js';

const rewriteType = (op) => (geometry) =>
  rewrite(geometry, (geometry, descend) => descend(op(geometry)));

const addType = (type) => (geometry) => {
  if (geometry.tags.includes(type)) {
    return undefined;
  } else {
    return { tags: [...geometry.tags, type] };
  }
};

const removeType = (type) => (geometry) => {
  if (geometry.tags.includes(type)) {
    return { tags: geometry.tags.filter((tag) => tag !== type) };
  } else {
    return undefined;
  }
};

export const hasNotType = (type) => rewriteType(removeType(type));
export const hasType = (type) => rewriteType(addType(type));
export const isNotType =
  (type) =>
  ({ tags }) =>
    !tags.includes(type);
export const isType =
  (type) =>
  ({ tags }) =>
    tags.includes(type);

export const typeReference = 'type:reference';
export const hasNotTypeReference = hasNotType(typeReference);
export const hasTypeReference = hasType(typeReference);
export const isNotTypeReference = isNotType(typeReference);
export const isTypeReference = isType(typeReference);

export const typeGhost = 'type:ghost';
export const hasNotTypeGhost = hasNotType(typeGhost);
export const hasTypeGhost = hasType(typeGhost);
export const isNotTypeGhost = isNotType(typeGhost);
export const isTypeGhost = isType(typeGhost);

export const typeLabel = 'type:label';
export const hasNotTypeLabel = hasNotType(typeLabel);
export const hasTypeLabel = hasType(typeLabel);
export const isNotTypeLabel = isNotType(typeLabel);
export const isTypeLabel = isType(typeLabel);

export const typeMasked = 'type:masked';
export const hasNotTypeMasked = hasNotType(typeMasked);
export const hasTypeMasked = hasType(typeMasked);
export const isNotTypeMasked = isNotType(typeMasked);
export const isTypeMasked = isType(typeMasked);

export const typeVoid = 'type:void';
export const hasNotTypeVoid = hasNotType(typeVoid);
export const hasTypeVoid = hasType(typeVoid);
export const isNotTypeVoid = isNotType(typeVoid);
export const isTypeVoid = isType(typeVoid);

// Structural types.
export const isGraph = ({ type }) => type === 'graph';
export const isPolygonsWithHoles = ({ type }) => type === 'polygonsWithHoles';
export const isSegments = ({ type }) => type === 'segments';
export const isPoints = ({ type }) => type === 'points';
