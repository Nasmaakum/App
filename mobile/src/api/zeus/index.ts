/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';


export const HOST="Specify host"


export const HEADERS = {}
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data) as any;
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions & { variables?: Record<string, unknown> }) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions & { variables?: ExtractVariables<Z> }) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: Z | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : never, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariables<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never
export type ScalarCoders = {
	Upload?: ScalarResolver;
	Date?: ScalarResolver;
	Null?: ScalarResolver;
	NullableString?: ScalarResolver;
	NullableNumber?: ScalarResolver;
	NullableID?: ScalarResolver;
	UntrimmedString?: ScalarResolver;
	LowercaseString?: ScalarResolver;
	UppercaseString?: ScalarResolver;
	EmailAddress?: ScalarResolver;
	Password?: ScalarResolver;
	OTP?: ScalarResolver;
	PhoneNumber?: ScalarResolver;
}
type ZEUS_UNIONS = never

export type ValueTypes = {
    ["About"]: AliasType<{
	id?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	version?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AboutWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["AboutWhereInput"]: {
	AND?: Array<ValueTypes["AboutWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["AboutWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["AboutWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["AboutCreateInput"]: {
	contentEn: string | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>
};
	["AboutUpdateInput"]: {
	contentEn?: string | undefined | null | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>
};
	["AboutOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["Advertisement"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	url?:boolean | `@${string}`,
	duration?:boolean | `@${string}`,
	active?:boolean | `@${string}`,
	views?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AdvertisementWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["AdvertisementWhereInput"]: {
	AND?: Array<ValueTypes["AdvertisementWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["AdvertisementWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["AdvertisementWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["AdvertisementCreateInput"]: {
	titleEn: string | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	contentEn: string | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>,
	image: ValueTypes["Upload"] | Variable<any, string>,
	url: string | Variable<any, string>,
	duration: number | Variable<any, string>,
	active: boolean | Variable<any, string>
};
	["AdvertisementUpdateInput"]: {
	titleEn?: string | undefined | null | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	contentEn?: string | undefined | null | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>,
	image?: ValueTypes["Upload"] | undefined | null | Variable<any, string>,
	url?: string | undefined | null | Variable<any, string>,
	duration?: number | undefined | null | Variable<any, string>,
	active?: boolean | undefined | null | Variable<any, string>
};
	["AdvertisementOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	views?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	active?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	duration?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["AuthenticationResponse"]: AliasType<{
	authentication?:ValueTypes["Authentication"],
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Authentication"]: AliasType<{
	user?:ValueTypes["User"],
	token?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LoginInput"]: {
	email: ValueTypes["EmailAddress"] | Variable<any, string>,
	password: string | Variable<any, string>
};
	["CheckEmailInput"]: {
	email: ValueTypes["EmailAddress"] | Variable<any, string>
};
	["RegistrationInterpreterInput"]: {
	languages: Array<string> | Variable<any, string>
};
	["VerifyRegistrationInput"]: {
	email: ValueTypes["EmailAddress"] | Variable<any, string>,
	code: ValueTypes["OTP"] | Variable<any, string>
};
	["RegistrationInput"]: {
	firstName: string | Variable<any, string>,
	lastName: string | Variable<any, string>,
	cpr: string | Variable<any, string>,
	email: ValueTypes["EmailAddress"] | Variable<any, string>,
	dateOfBirth: ValueTypes["Date"] | Variable<any, string>,
	language: string | Variable<any, string>,
	country: string | Variable<any, string>,
	city: string | Variable<any, string>,
	mobile: ValueTypes["PhoneNumber"] | Variable<any, string>,
	gender: ValueTypes["Gender"] | Variable<any, string>,
	password: ValueTypes["Password"] | Variable<any, string>,
	interpreter?: ValueTypes["RegistrationInterpreterInput"] | undefined | null | Variable<any, string>,
	acceptPrivacyPolicy: boolean | Variable<any, string>,
	acceptTermsOfUse: boolean | Variable<any, string>
};
	["RequestPasswordResetInput"]: {
	email: ValueTypes["EmailAddress"] | Variable<any, string>
};
	["VerifyPasswordResetInput"]: {
	email: ValueTypes["EmailAddress"] | Variable<any, string>,
	code: ValueTypes["OTP"] | Variable<any, string>
};
	["ResetPasswordInput"]: {
	code: ValueTypes["OTP"] | Variable<any, string>,
	email: ValueTypes["EmailAddress"] | Variable<any, string>,
	password: ValueTypes["Password"] | Variable<any, string>
};
	["ChangePasswordInput"]: {
	currentPassword: string | Variable<any, string>,
	newPassword: ValueTypes["Password"] | Variable<any, string>
};
	["CallStatus"]:CallStatus;
	["Call"]: AliasType<{
	id?:boolean | `@${string}`,
	from?:ValueTypes["User"],
	to?:ValueTypes["Interpreter"],
	token?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	service?:ValueTypes["Service"],
	startedAt?:boolean | `@${string}`,
	endedAt?:boolean | `@${string}`,
	serviceCalledAt?:boolean | `@${string}`,
	serviceEndedAt?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CallWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["CallWhereInput"]: {
	AND?: Array<ValueTypes["CallWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["CallWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["CallWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["StartCallWhereInput"]: {
	id: string | Variable<any, string>
};
	["KeepCallAliveWhereInput"]: {
	id: string | Variable<any, string>
};
	["KeepCallAliveData"]: {
	getToken?: boolean | undefined | null | Variable<any, string>
};
	["EndCallInput"]: {
	id: string | Variable<any, string>
};
	["CallOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["ConnectServiceInput"]: {
	id: string | Variable<any, string>
};
	["Query"]: AliasType<{
	_empty?:boolean | `@${string}`,
	latestAbout?:ValueTypes["About"],
about?: [{	where: ValueTypes["AboutWhereUniqueInput"] | Variable<any, string>},ValueTypes["About"]],
abouts?: [{	where?: ValueTypes["AboutWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["AboutOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["About"]],
aboutsCount?: [{	where?: ValueTypes["AboutWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
advertisement?: [{	where: ValueTypes["AdvertisementWhereUniqueInput"] | Variable<any, string>},ValueTypes["Advertisement"]],
advertisements?: [{	where?: ValueTypes["AdvertisementWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["AdvertisementOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["Advertisement"]],
advertisementsCount?: [{	where?: ValueTypes["AdvertisementWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	activeAdvertisements?:ValueTypes["Advertisement"],
login?: [{	data: ValueTypes["LoginInput"] | Variable<any, string>},ValueTypes["AuthenticationResponse"]],
call?: [{	where: ValueTypes["CallWhereUniqueInput"] | Variable<any, string>},ValueTypes["Call"]],
calls?: [{	where?: ValueTypes["CallWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["CallOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["Call"]],
callsCount?: [{	where?: ValueTypes["CallWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	outboundNumber?:boolean | `@${string}`,
frequentlyAskedQuestion?: [{	where: ValueTypes["FrequentlyAskedQuestionWhereUniqueInput"] | Variable<any, string>},ValueTypes["FrequentlyAskedQuestion"]],
frequentlyAskedQuestions?: [{	where?: ValueTypes["FrequentlyAskedQuestionWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["FrequentlyAskedQuestionOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["FrequentlyAskedQuestion"]],
frequentlyAskedQuestionsCount?: [{	where?: ValueTypes["FrequentlyAskedQuestionWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
interpreterRatingOption?: [{	where: ValueTypes["InterpreterRatingOptionWhereUniqueInput"] | Variable<any, string>},ValueTypes["InterpreterRatingOption"]],
interpreterRatingOptions?: [{	where?: ValueTypes["InterpreterRatingOptionWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["InterpreterRatingOptionOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["InterpreterRatingOption"]],
interpreterRatingOptionsCount?: [{	where?: ValueTypes["InterpreterRatingOptionWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
interpreterRating?: [{	where: ValueTypes["InterpreterRatingWhereUniqueInput"] | Variable<any, string>},ValueTypes["InterpreterRating"]],
interpreterRatings?: [{	where?: ValueTypes["InterpreterRatingWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["InterpreterRatingOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["InterpreterRating"]],
interpreterRatingsCount?: [{	where?: ValueTypes["InterpreterRatingWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
interpreter?: [{	where: ValueTypes["InterpreterWhereUniqueInput"] | Variable<any, string>},ValueTypes["Interpreter"]],
interpreters?: [{	where?: ValueTypes["InterpreterWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["InterpreterOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["Interpreter"]],
interpretersCount?: [{	where?: ValueTypes["InterpreterWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	myAvailability?:boolean | `@${string}`,
	maintenanceMode?:ValueTypes["MessageResponse"],
compareVersions?: [{	data: ValueTypes["CompareVersionsInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
notification?: [{	where: ValueTypes["NotificationWhereUniqueInput"] | Variable<any, string>},ValueTypes["Notification"]],
notifications?: [{	where?: ValueTypes["NotificationWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["NotificationOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["Notification"]],
myNotifications?: [{	where?: ValueTypes["NotificationWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["NotificationOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["Notification"]],
notificationsCount?: [{	where?: ValueTypes["NotificationWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
myNotificationsCount?: [{	where?: ValueTypes["NotificationWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	latestPrivacyPolicy?:ValueTypes["PrivacyPolicy"],
privacyPolicy?: [{	where: ValueTypes["PrivacyPolicyWhereUniqueInput"] | Variable<any, string>},ValueTypes["PrivacyPolicy"]],
privacyPolicies?: [{	where?: ValueTypes["PrivacyPolicyWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["PrivacyPolicyOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["PrivacyPolicy"]],
privacyPoliciesCount?: [{	where?: ValueTypes["PrivacyPolicyWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
serviceCategory?: [{	where: ValueTypes["ServiceCategoryWhereUniqueInput"] | Variable<any, string>},ValueTypes["ServiceCategory"]],
serviceCategories?: [{	where?: ValueTypes["ServiceCategoryWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["ServiceCategoryOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["ServiceCategory"]],
serviceCategoriesCount?: [{	where?: ValueTypes["ServiceCategoryWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
service?: [{	where: ValueTypes["ServiceWhereUniqueInput"] | Variable<any, string>},ValueTypes["Service"]],
services?: [{	where?: ValueTypes["ServiceWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["ServiceOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["Service"]],
servicesCount?: [{	where?: ValueTypes["ServiceWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	latestTermsOfUse?:ValueTypes["TermsOfUse"],
termsOfUse?: [{	where: ValueTypes["TermsOfUseWhereUniqueInput"] | Variable<any, string>},ValueTypes["TermsOfUse"]],
termsOfUses?: [{	where?: ValueTypes["TermsOfUseWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["TermsOfUseOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["TermsOfUse"]],
termsOfUsesCount?: [{	where?: ValueTypes["TermsOfUseWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	myUser?:ValueTypes["User"],
user?: [{	where: ValueTypes["UserWhereUniqueInput"] | Variable<any, string>},ValueTypes["User"]],
users?: [{	where?: ValueTypes["UserWhereInput"] | undefined | null | Variable<any, string>,	orderBy?: Array<ValueTypes["UserOrderByInput"]> | undefined | null | Variable<any, string>,	take?: number | undefined | null | Variable<any, string>,	skip?: number | undefined | null | Variable<any, string>},ValueTypes["User"]],
usersCount?: [{	where?: ValueTypes["UserWhereInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	myPreferences?:ValueTypes["UserPreferences"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	_empty?:boolean | `@${string}`,
createAbout?: [{	data: ValueTypes["AboutCreateInput"] | Variable<any, string>},ValueTypes["About"]],
updateAbout?: [{	where: ValueTypes["AboutWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["AboutUpdateInput"] | Variable<any, string>},ValueTypes["About"]],
deleteAbout?: [{	where: ValueTypes["AboutWhereUniqueInput"] | Variable<any, string>},ValueTypes["About"]],
createAdvertisement?: [{	data: ValueTypes["AdvertisementCreateInput"] | Variable<any, string>},ValueTypes["Advertisement"]],
updateAdvertisement?: [{	where: ValueTypes["AdvertisementWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["AdvertisementUpdateInput"] | Variable<any, string>},ValueTypes["Advertisement"]],
deleteAdvertisement?: [{	where: ValueTypes["AdvertisementWhereUniqueInput"] | Variable<any, string>},ValueTypes["Advertisement"]],
activateAdvertisement?: [{	where: ValueTypes["AdvertisementWhereUniqueInput"] | Variable<any, string>},ValueTypes["Advertisement"]],
register?: [{	data: ValueTypes["RegistrationInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
verifyRegistration?: [{	data: ValueTypes["VerifyRegistrationInput"] | Variable<any, string>},ValueTypes["AuthenticationResponse"]],
requestPasswordReset?: [{	data: ValueTypes["RequestPasswordResetInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
verifyPasswordReset?: [{	data: ValueTypes["VerifyPasswordResetInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
resetPassword?: [{	data: ValueTypes["ResetPasswordInput"] | Variable<any, string>},ValueTypes["AuthenticationResponse"]],
changePassword?: [{	data: ValueTypes["ChangePasswordInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
	activeCall?:ValueTypes["Call"],
startCall?: [{	where: ValueTypes["StartCallWhereInput"] | Variable<any, string>},ValueTypes["Call"]],
	endCall?:ValueTypes["Call"],
keepCallAlive?: [{	where: ValueTypes["KeepCallAliveWhereInput"] | Variable<any, string>,	data: ValueTypes["KeepCallAliveData"] | Variable<any, string>},ValueTypes["Call"]],
	answerCall?:ValueTypes["Call"],
	rejectCall?:ValueTypes["Call"],
connectService?: [{	data: ValueTypes["ConnectServiceInput"] | Variable<any, string>},ValueTypes["Call"]],
	disconnectService?:ValueTypes["Call"],
createFrequentlyAskedQuestion?: [{	data: ValueTypes["FrequentlyAskedQuestionCreateInput"] | Variable<any, string>},ValueTypes["FrequentlyAskedQuestion"]],
updateFrequentlyAskedQuestion?: [{	where: ValueTypes["FrequentlyAskedQuestionWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["FrequentlyAskedQuestionUpdateInput"] | Variable<any, string>},ValueTypes["FrequentlyAskedQuestion"]],
deleteFrequentlyAskedQuestion?: [{	where: ValueTypes["FrequentlyAskedQuestionWhereUniqueInput"] | Variable<any, string>},ValueTypes["FrequentlyAskedQuestion"]],
createInterpreterRatingOption?: [{	data: ValueTypes["InterpreterRatingOptionCreateInput"] | Variable<any, string>},ValueTypes["InterpreterRatingOption"]],
updateInterpreterRatingOption?: [{	where: ValueTypes["InterpreterRatingOptionWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["InterpreterRatingOptionUpdateInput"] | Variable<any, string>},ValueTypes["InterpreterRatingOption"]],
deleteInterpreterRatingOption?: [{	where: ValueTypes["InterpreterRatingOptionWhereUniqueInput"] | Variable<any, string>},ValueTypes["InterpreterRatingOption"]],
createInterpreterRating?: [{	data: ValueTypes["InterpreterRatingCreateInput"] | Variable<any, string>},ValueTypes["InterpreterRating"]],
updateInterpreterRating?: [{	where: ValueTypes["InterpreterRatingWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["InterpreterRatingUpdateInput"] | Variable<any, string>},ValueTypes["InterpreterRating"]],
deleteInterpreterRating?: [{	where: ValueTypes["InterpreterRatingWhereUniqueInput"] | Variable<any, string>},ValueTypes["InterpreterRating"]],
approveInterpreter?: [{	where: ValueTypes["InterpreterWhereUniqueInput"] | Variable<any, string>},ValueTypes["Interpreter"]],
rejectInterpreter?: [{	where: ValueTypes["InterpreterWhereUniqueInput"] | Variable<any, string>},ValueTypes["Interpreter"]],
updateInterpreter?: [{	where: ValueTypes["InterpreterWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["InterpreterUpdateInput"] | Variable<any, string>},ValueTypes["Interpreter"]],
updateMyInterpreter?: [{	data: ValueTypes["MyInterpreterUpdateInput"] | Variable<any, string>},ValueTypes["Interpreter"]],
	toggleInterpreterAvailability?:boolean | `@${string}`,
toggleFavoriteInterpreter?: [{	where: ValueTypes["InterpreterWhereUniqueInput"] | Variable<any, string>},boolean | `@${string}`],
	toggleMaintenanceMode?:ValueTypes["MessageResponse"],
submitExpoToken?: [{	data: ValueTypes["SubmitExpoTokenInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
sendNotification?: [{	data: ValueTypes["SendNotificationInput"] | Variable<any, string>},ValueTypes["MessageResponse"]],
createNotification?: [{	data: ValueTypes["NotificationCreateInput"] | Variable<any, string>},ValueTypes["Notification"]],
updateNotification?: [{	where: ValueTypes["NotificationWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["NotificationUpdateInput"] | Variable<any, string>},ValueTypes["Notification"]],
deleteNotification?: [{	where: ValueTypes["NotificationWhereUniqueInput"] | Variable<any, string>},ValueTypes["Notification"]],
createPrivacyPolicy?: [{	data: ValueTypes["PrivacyPolicyCreateInput"] | Variable<any, string>},ValueTypes["PrivacyPolicy"]],
updatePrivacyPolicy?: [{	where: ValueTypes["PrivacyPolicyWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["PrivacyPolicyUpdateInput"] | Variable<any, string>},ValueTypes["PrivacyPolicy"]],
deletePrivacyPolicy?: [{	where: ValueTypes["PrivacyPolicyWhereUniqueInput"] | Variable<any, string>},ValueTypes["PrivacyPolicy"]],
acceptPrivacyPolicy?: [{	where: ValueTypes["PrivacyPolicyWhereUniqueInput"] | Variable<any, string>},ValueTypes["PrivacyPolicyAcceptance"]],
createServiceCategory?: [{	data: ValueTypes["ServiceCategoryCreateInput"] | Variable<any, string>},ValueTypes["ServiceCategory"]],
updateServiceCategory?: [{	where: ValueTypes["ServiceCategoryWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["ServiceCategoryUpdateInput"] | Variable<any, string>},ValueTypes["ServiceCategory"]],
deleteServiceCategory?: [{	where: ValueTypes["ServiceCategoryWhereUniqueInput"] | Variable<any, string>},ValueTypes["ServiceCategory"]],
createService?: [{	data: ValueTypes["ServiceCreateInput"] | Variable<any, string>},ValueTypes["Service"]],
updateService?: [{	where: ValueTypes["ServiceWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["ServiceUpdateInput"] | Variable<any, string>},ValueTypes["Service"]],
deleteService?: [{	where: ValueTypes["ServiceWhereUniqueInput"] | Variable<any, string>},ValueTypes["Service"]],
createTermsOfUse?: [{	data: ValueTypes["TermsOfUseCreateInput"] | Variable<any, string>},ValueTypes["TermsOfUse"]],
updateTermsOfUse?: [{	where: ValueTypes["TermsOfUseWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["TermsOfUseUpdateInput"] | Variable<any, string>},ValueTypes["TermsOfUse"]],
deleteTermsOfUse?: [{	where: ValueTypes["TermsOfUseWhereUniqueInput"] | Variable<any, string>},ValueTypes["TermsOfUse"]],
acceptTermsOfUse?: [{	where: ValueTypes["TermsOfUseWhereUniqueInput"] | Variable<any, string>},ValueTypes["TermsOfUseAcceptance"]],
createUser?: [{	data: ValueTypes["UserCreateInput"] | Variable<any, string>},ValueTypes["User"]],
updateMyUser?: [{	data: ValueTypes["MyUserUpdateInput"] | Variable<any, string>},ValueTypes["User"]],
updateUser?: [{	where: ValueTypes["UserWhereUniqueInput"] | Variable<any, string>,	data: ValueTypes["UserUpdateInput"] | Variable<any, string>},ValueTypes["User"]],
deleteMyUser?: [{	data: ValueTypes["MyUserDeleteInput"] | Variable<any, string>},ValueTypes["User"]],
deleteUser?: [{	where: ValueTypes["UserWhereUniqueInput"] | Variable<any, string>},ValueTypes["User"]],
updateMyPreferences?: [{	data: ValueTypes["MyUserPreferencesUpdateInput"] | Variable<any, string>},ValueTypes["UserPreferences"]],
		__typename?: boolean | `@${string}`
}>;
	["IDFilter"]: {
	equals?: string | undefined | null | Variable<any, string>,
	in?: Array<string> | undefined | null | Variable<any, string>,
	notIn?: Array<string> | undefined | null | Variable<any, string>,
	lt?: string | undefined | null | Variable<any, string>,
	lte?: string | undefined | null | Variable<any, string>,
	gt?: string | undefined | null | Variable<any, string>,
	gte?: string | undefined | null | Variable<any, string>,
	not?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["RelationshipNullableFilter"]: {
	id?: string | undefined | null | Variable<any, string>,
	is?: ValueTypes["Null"] | undefined | null | Variable<any, string>,
	isNot?: ValueTypes["Null"] | undefined | null | Variable<any, string>
};
	["ArrayNullableFilter"]: {
	equals?: Array<string> | undefined | null | Variable<any, string>,
	hasSome?: Array<string> | undefined | null | Variable<any, string>,
	hasEvery?: Array<string> | undefined | null | Variable<any, string>,
	has?: string | undefined | null | Variable<any, string>,
	isEmpty?: boolean | undefined | null | Variable<any, string>
};
	["StringNullableFilter"]: {
	equals?: string | undefined | null | Variable<any, string>,
	in?: Array<string> | undefined | null | Variable<any, string>,
	notIn?: Array<string> | undefined | null | Variable<any, string>,
	lt?: string | undefined | null | Variable<any, string>,
	lte?: string | undefined | null | Variable<any, string>,
	gt?: string | undefined | null | Variable<any, string>,
	gte?: string | undefined | null | Variable<any, string>,
	contains?: string | undefined | null | Variable<any, string>,
	startsWith?: string | undefined | null | Variable<any, string>,
	endsWith?: string | undefined | null | Variable<any, string>,
	mode?: ValueTypes["QueryMode"] | undefined | null | Variable<any, string>,
	not?: ValueTypes["NestedStringNullableFilter"] | undefined | null | Variable<any, string>
};
	["NestedStringNullableFilter"]: {
	equals?: string | undefined | null | Variable<any, string>,
	in?: Array<string> | undefined | null | Variable<any, string>,
	notIn?: Array<string> | undefined | null | Variable<any, string>,
	lt?: string | undefined | null | Variable<any, string>,
	lte?: string | undefined | null | Variable<any, string>,
	gt?: string | undefined | null | Variable<any, string>,
	gte?: string | undefined | null | Variable<any, string>,
	contains?: string | undefined | null | Variable<any, string>,
	startsWith?: string | undefined | null | Variable<any, string>,
	endsWith?: string | undefined | null | Variable<any, string>,
	not?: ValueTypes["NestedStringNullableFilter"] | undefined | null | Variable<any, string>
};
	["IntNullableFilter"]: {
	equals?: number | undefined | null | Variable<any, string>,
	in?: Array<number> | undefined | null | Variable<any, string>,
	notIn?: Array<number> | undefined | null | Variable<any, string>,
	lt?: number | undefined | null | Variable<any, string>,
	lte?: number | undefined | null | Variable<any, string>,
	gt?: number | undefined | null | Variable<any, string>,
	gte?: number | undefined | null | Variable<any, string>,
	not?: ValueTypes["NestedIntNullableFilter"] | undefined | null | Variable<any, string>
};
	["NestedIntNullableFilter"]: {
	equals?: number | undefined | null | Variable<any, string>,
	in?: Array<number> | undefined | null | Variable<any, string>,
	notIn?: Array<number> | undefined | null | Variable<any, string>,
	lt?: number | undefined | null | Variable<any, string>,
	lte?: number | undefined | null | Variable<any, string>,
	gt?: number | undefined | null | Variable<any, string>,
	gte?: number | undefined | null | Variable<any, string>,
	not?: ValueTypes["NestedIntNullableFilter"] | undefined | null | Variable<any, string>
};
	["FloatNullableFilter"]: {
	equals?: number | undefined | null | Variable<any, string>,
	in?: Array<number> | undefined | null | Variable<any, string>,
	notIn?: Array<number> | undefined | null | Variable<any, string>,
	lt?: number | undefined | null | Variable<any, string>,
	lte?: number | undefined | null | Variable<any, string>,
	gt?: number | undefined | null | Variable<any, string>,
	gte?: number | undefined | null | Variable<any, string>,
	not?: ValueTypes["NestedFloatNullableFilter"] | undefined | null | Variable<any, string>
};
	["NestedFloatNullableFilter"]: {
	equals?: number | undefined | null | Variable<any, string>,
	in?: Array<number> | undefined | null | Variable<any, string>,
	notIn?: Array<number> | undefined | null | Variable<any, string>,
	lt?: number | undefined | null | Variable<any, string>,
	lte?: number | undefined | null | Variable<any, string>,
	gt?: number | undefined | null | Variable<any, string>,
	gte?: number | undefined | null | Variable<any, string>,
	not?: ValueTypes["NestedFloatNullableFilter"] | undefined | null | Variable<any, string>
};
	["QueryMode"]:QueryMode;
	["OrderDirection"]:OrderDirection;
	["BatchPayload"]: AliasType<{
	count?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Gender"]:Gender;
	["MessageResponse"]: AliasType<{
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["FrequentlyAskedQuestion"]: AliasType<{
	id?:boolean | `@${string}`,
	question?:boolean | `@${string}`,
	questionEn?:boolean | `@${string}`,
	questionAr?:boolean | `@${string}`,
	answer?:boolean | `@${string}`,
	answerEn?:boolean | `@${string}`,
	answerAr?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["FrequentlyAskedQuestionWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["FrequentlyAskedQuestionWhereInput"]: {
	AND?: Array<ValueTypes["FrequentlyAskedQuestionWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["FrequentlyAskedQuestionWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["FrequentlyAskedQuestionWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["FrequentlyAskedQuestionCreateInput"]: {
	questionEn: string | Variable<any, string>,
	questionAr?: string | undefined | null | Variable<any, string>,
	answerEn: string | Variable<any, string>,
	answerAr?: string | undefined | null | Variable<any, string>
};
	["FrequentlyAskedQuestionUpdateInput"]: {
	questionEn?: string | undefined | null | Variable<any, string>,
	questionAr?: string | undefined | null | Variable<any, string>,
	answerEn?: string | undefined | null | Variable<any, string>,
	answerAr?: string | undefined | null | Variable<any, string>
};
	["FrequentlyAskedQuestionOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["InterpreterRatingOption"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	ratingVisibleFrom?:boolean | `@${string}`,
	ratingVisibleTo?:boolean | `@${string}`,
	ratings?:ValueTypes["InterpreterRating"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["InterpreterRatingOptionWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["InterpreterRatingOptionWhereInput"]: {
	AND?: Array<ValueTypes["InterpreterRatingOptionWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["InterpreterRatingOptionWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["InterpreterRatingOptionWhereInput"]> | undefined | null | Variable<any, string>,
	ratingVisibleFrom?: ValueTypes["FloatNullableFilter"] | undefined | null | Variable<any, string>,
	ratingVisibleTo?: ValueTypes["FloatNullableFilter"] | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["InterpreterRatingOptionCreateInput"]: {
	titleEn: string | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	ratingVisibleFrom: number | Variable<any, string>,
	ratingVisibleTo: number | Variable<any, string>
};
	["InterpreterRatingOptionUpdateInput"]: {
	titleEn?: string | undefined | null | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	ratingVisibleFrom?: number | undefined | null | Variable<any, string>,
	ratingVisibleTo?: number | undefined | null | Variable<any, string>
};
	["InterpreterRatingOptionOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["InterpreterRating"]: AliasType<{
	id?:boolean | `@${string}`,
	rating?:boolean | `@${string}`,
	options?:ValueTypes["InterpreterRatingOption"],
	tellUsMore?:boolean | `@${string}`,
	ip?:boolean | `@${string}`,
	interpreter?:ValueTypes["Interpreter"],
	user?:ValueTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["InterpreterRatingWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["InterpreterRatingWhereInput"]: {
	AND?: Array<ValueTypes["InterpreterRatingWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["InterpreterRatingWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["InterpreterRatingWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["InterpreterRatingCreateInput"]: {
	interpreter: string | Variable<any, string>,
	rating: number | Variable<any, string>,
	tellUsMore?: string | undefined | null | Variable<any, string>,
	options: Array<string> | Variable<any, string>
};
	["InterpreterRatingUpdateInput"]: {
	interpreter?: string | undefined | null | Variable<any, string>,
	rating?: number | undefined | null | Variable<any, string>,
	tellUsMore?: string | undefined | null | Variable<any, string>,
	options?: Array<string> | undefined | null | Variable<any, string>
};
	["InterpreterRatingOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["InterpreterStatus"]:InterpreterStatus;
	["InterpreterUser"]: AliasType<{
	id?:boolean | `@${string}`,
	firstName?:boolean | `@${string}`,
	lastName?:boolean | `@${string}`,
	fullName?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Interpreter"]: AliasType<{
	id?:boolean | `@${string}`,
	languages?:boolean | `@${string}`,
	ratings?:ValueTypes["InterpreterRating"],
	rating?:boolean | `@${string}`,
	user?:ValueTypes["InterpreterUser"],
	online?:boolean | `@${string}`,
	approved?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	isBusy?:boolean | `@${string}`,
	isFavorite?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["InterpreterWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["InterpreterWhereInput"]: {
	AND?: Array<ValueTypes["InterpreterWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["InterpreterWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["InterpreterWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["InterpreterUpdateInput"]: {
	languages?: Array<string> | undefined | null | Variable<any, string>,
	status?: ValueTypes["InterpreterStatus"] | undefined | null | Variable<any, string>
};
	["MyInterpreterUpdateInput"]: {
	languages?: Array<string> | undefined | null | Variable<any, string>
};
	["InterpreterOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	approved?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	online?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["SubmitExpoTokenInput"]: {
	token: string | Variable<any, string>
};
	["CompareVersionsInput"]: {
	version: string | Variable<any, string>
};
	["SendNotificationInput"]: {
	title: string | Variable<any, string>,
	body: string | Variable<any, string>,
	test?: boolean | undefined | null | Variable<any, string>
};
	["Notification"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	message?:boolean | `@${string}`,
	messageEn?:boolean | `@${string}`,
	messageAr?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["NotificationWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["NotificationWhereInput"]: {
	AND?: Array<ValueTypes["NotificationWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["NotificationWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["NotificationWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["NotificationCreateInput"]: {
	titleEn: string | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	messageEn: string | Variable<any, string>,
	messageAr?: string | undefined | null | Variable<any, string>
};
	["NotificationUpdateInput"]: {
	titleEn?: string | undefined | null | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	messageEn?: string | undefined | null | Variable<any, string>,
	messageAr?: string | undefined | null | Variable<any, string>
};
	["NotificationOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["PrivacyPolicyAcceptance"]: AliasType<{
	id?:boolean | `@${string}`,
	privacyPolicy?:ValueTypes["PrivacyPolicy"],
	user?:ValueTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PrivacyPolicy"]: AliasType<{
	id?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	version?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PrivacyPolicyWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["PrivacyPolicyWhereInput"]: {
	AND?: Array<ValueTypes["PrivacyPolicyWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["PrivacyPolicyWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["PrivacyPolicyWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["PrivacyPolicyCreateInput"]: {
	contentEn: string | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>
};
	["PrivacyPolicyUpdateInput"]: {
	contentEn?: string | undefined | null | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>
};
	["PrivacyPolicyOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["Upload"]: any;
	["Date"]: string;
	["Null"]: null | undefined;
	["NullableString"]: null | string;
	["NullableNumber"]: null | number;
	["NullableID"]: null | string;
	["UntrimmedString"]: string;
	["LowercaseString"]: string;
	["UppercaseString"]: string;
	["EmailAddress"]: string;
	["Password"]: string;
	["OTP"]: string;
	["PhoneNumber"]: string;
	["ServiceCategory"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	services?:ValueTypes["Service"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ServiceCategoryWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["ServiceCategoryWhereInput"]: {
	AND?: Array<ValueTypes["ServiceCategoryWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["ServiceCategoryWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["ServiceCategoryWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["ServiceCategoryCreateInput"]: {
	titleEn: string | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	image: ValueTypes["Upload"] | Variable<any, string>
};
	["ServiceCategoryUpdateInput"]: {
	titleEn?: string | undefined | null | Variable<any, string>,
	titleAr?: string | undefined | null | Variable<any, string>,
	image?: ValueTypes["Upload"] | undefined | null | Variable<any, string>
};
	["ServiceCategoryOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	titleEn?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["Service"]: AliasType<{
	id?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	nameEn?:boolean | `@${string}`,
	nameAr?:boolean | `@${string}`,
	description?:boolean | `@${string}`,
	descriptionEn?:boolean | `@${string}`,
	descriptionAr?:boolean | `@${string}`,
	phone?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	category?:ValueTypes["ServiceCategory"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ServiceWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["ServiceWhereInput"]: {
	AND?: Array<ValueTypes["ServiceWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["ServiceWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["ServiceWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["ServiceCreateInput"]: {
	nameEn: string | Variable<any, string>,
	nameAr?: string | undefined | null | Variable<any, string>,
	descriptionEn: string | Variable<any, string>,
	descriptionAr?: string | undefined | null | Variable<any, string>,
	phone: ValueTypes["PhoneNumber"] | Variable<any, string>,
	image: ValueTypes["Upload"] | Variable<any, string>,
	categoryId: string | Variable<any, string>
};
	["ServiceUpdateInput"]: {
	nameEn?: string | undefined | null | Variable<any, string>,
	nameAr?: string | undefined | null | Variable<any, string>,
	descriptionEn?: string | undefined | null | Variable<any, string>,
	descriptionAr?: string | undefined | null | Variable<any, string>,
	phone?: ValueTypes["PhoneNumber"] | undefined | null | Variable<any, string>,
	image?: ValueTypes["Upload"] | undefined | null | Variable<any, string>,
	categoryId?: string | undefined | null | Variable<any, string>
};
	["ServiceOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["TermsOfUseAcceptance"]: AliasType<{
	id?:boolean | `@${string}`,
	termsOfUse?:ValueTypes["TermsOfUse"],
	user?:ValueTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["TermsOfUse"]: AliasType<{
	id?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	version?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["TermsOfUseWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>
};
	["TermsOfUseWhereInput"]: {
	AND?: Array<ValueTypes["TermsOfUseWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["TermsOfUseWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["TermsOfUseWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>
};
	["TermsOfUseCreateInput"]: {
	contentEn: string | Variable<any, string>,
	contentAr: string | Variable<any, string>
};
	["TermsOfUseUpdateInput"]: {
	contentEn?: string | undefined | null | Variable<any, string>,
	contentAr?: string | undefined | null | Variable<any, string>
};
	["TermsOfUseOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["UserPreferences"]: AliasType<{
	id?:boolean | `@${string}`,
	emailNotifications?:boolean | `@${string}`,
	smsNotifications?:boolean | `@${string}`,
	pushNotifications?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["UserRole"]:UserRole;
	["User"]: AliasType<{
	id?:boolean | `@${string}`,
	firstName?:boolean | `@${string}`,
	lastName?:boolean | `@${string}`,
	fullName?:boolean | `@${string}`,
	cpr?:boolean | `@${string}`,
	email?:boolean | `@${string}`,
	dateOfBirth?:boolean | `@${string}`,
	language?:boolean | `@${string}`,
	country?:boolean | `@${string}`,
	city?:boolean | `@${string}`,
	mobile?:boolean | `@${string}`,
	gender?:boolean | `@${string}`,
	role?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	preferences?:ValueTypes["UserPreferences"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["UserWhereUniqueInput"]: {
	id?: string | undefined | null | Variable<any, string>,
	email?: ValueTypes["EmailAddress"] | undefined | null | Variable<any, string>
};
	["UserRoleNullableFilter"]: {
	equals?: ValueTypes["UserRole"] | undefined | null | Variable<any, string>,
	in?: Array<ValueTypes["UserRole"]> | undefined | null | Variable<any, string>,
	notIn?: Array<ValueTypes["UserRole"]> | undefined | null | Variable<any, string>
};
	["UserWhereInput"]: {
	AND?: Array<ValueTypes["UserWhereInput"]> | undefined | null | Variable<any, string>,
	OR?: Array<ValueTypes["UserWhereInput"]> | undefined | null | Variable<any, string>,
	NOT?: Array<ValueTypes["UserWhereInput"]> | undefined | null | Variable<any, string>,
	id?: ValueTypes["IDFilter"] | undefined | null | Variable<any, string>,
	firstName?: ValueTypes["StringNullableFilter"] | undefined | null | Variable<any, string>,
	lastName?: ValueTypes["StringNullableFilter"] | undefined | null | Variable<any, string>,
	email?: ValueTypes["StringNullableFilter"] | undefined | null | Variable<any, string>,
	role?: ValueTypes["UserRoleNullableFilter"] | undefined | null | Variable<any, string>
};
	["UserCreateInput"]: {
	firstName: string | Variable<any, string>,
	lastName: string | Variable<any, string>,
	cpr: string | Variable<any, string>,
	email: ValueTypes["EmailAddress"] | Variable<any, string>,
	dateOfBirth: ValueTypes["Date"] | Variable<any, string>,
	language: ValueTypes["UppercaseString"] | Variable<any, string>,
	country: string | Variable<any, string>,
	city: string | Variable<any, string>,
	mobile: ValueTypes["PhoneNumber"] | Variable<any, string>,
	gender: ValueTypes["Gender"] | Variable<any, string>,
	password: ValueTypes["Password"] | Variable<any, string>,
	role?: ValueTypes["UserRole"] | undefined | null | Variable<any, string>,
	image?: ValueTypes["Upload"] | undefined | null | Variable<any, string>
};
	["UserUpdateInput"]: {
	firstName?: string | undefined | null | Variable<any, string>,
	lastName?: string | undefined | null | Variable<any, string>,
	cpr?: string | undefined | null | Variable<any, string>,
	email?: ValueTypes["EmailAddress"] | undefined | null | Variable<any, string>,
	dateOfBirth?: ValueTypes["Date"] | undefined | null | Variable<any, string>,
	language?: ValueTypes["UppercaseString"] | undefined | null | Variable<any, string>,
	country?: string | undefined | null | Variable<any, string>,
	city?: string | undefined | null | Variable<any, string>,
	mobile?: ValueTypes["PhoneNumber"] | undefined | null | Variable<any, string>,
	gender?: ValueTypes["Gender"] | undefined | null | Variable<any, string>,
	password?: ValueTypes["Password"] | undefined | null | Variable<any, string>,
	role?: ValueTypes["UserRole"] | undefined | null | Variable<any, string>,
	image?: ValueTypes["Upload"] | undefined | null | Variable<any, string>
};
	["MyUserUpdateInput"]: {
	firstName?: string | undefined | null | Variable<any, string>,
	lastName?: string | undefined | null | Variable<any, string>,
	cpr?: string | undefined | null | Variable<any, string>,
	email?: ValueTypes["EmailAddress"] | undefined | null | Variable<any, string>,
	dateOfBirth?: ValueTypes["Date"] | undefined | null | Variable<any, string>,
	language?: ValueTypes["UppercaseString"] | undefined | null | Variable<any, string>,
	country?: string | undefined | null | Variable<any, string>,
	city?: string | undefined | null | Variable<any, string>,
	mobile?: ValueTypes["PhoneNumber"] | undefined | null | Variable<any, string>,
	gender?: ValueTypes["Gender"] | undefined | null | Variable<any, string>,
	image?: ValueTypes["Upload"] | undefined | null | Variable<any, string>
};
	["MyUserPreferencesUpdateInput"]: {
	emailNotifications?: boolean | undefined | null | Variable<any, string>,
	smsNotifications?: boolean | undefined | null | Variable<any, string>,
	pushNotifications?: boolean | undefined | null | Variable<any, string>
};
	["MyUserDeleteInput"]: {
	password: string | Variable<any, string>
};
	["UserOrderByInput"]: {
	id?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	firstName?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	lastName?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	email?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	role?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>,
	createdAt?: ValueTypes["OrderDirection"] | undefined | null | Variable<any, string>
};
	["UserFilter"]: {
	firstName?: string | undefined | null | Variable<any, string>,
	lastName?: string | undefined | null | Variable<any, string>,
	email?: ValueTypes["EmailAddress"] | undefined | null | Variable<any, string>,
	role?: ValueTypes["UserRole"] | undefined | null | Variable<any, string>
}
  }

export type ResolverInputTypes = {
    ["About"]: AliasType<{
	id?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	version?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AboutWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["AboutWhereInput"]: {
	AND?: Array<ResolverInputTypes["AboutWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["AboutWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["AboutWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["AboutCreateInput"]: {
	contentEn: string,
	contentAr?: string | undefined | null
};
	["AboutUpdateInput"]: {
	contentEn?: string | undefined | null,
	contentAr?: string | undefined | null
};
	["AboutOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["Advertisement"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	url?:boolean | `@${string}`,
	duration?:boolean | `@${string}`,
	active?:boolean | `@${string}`,
	views?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AdvertisementWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["AdvertisementWhereInput"]: {
	AND?: Array<ResolverInputTypes["AdvertisementWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["AdvertisementWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["AdvertisementWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["AdvertisementCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined | null,
	contentEn: string,
	contentAr?: string | undefined | null,
	image: ResolverInputTypes["Upload"],
	url: string,
	duration: number,
	active: boolean
};
	["AdvertisementUpdateInput"]: {
	titleEn?: string | undefined | null,
	titleAr?: string | undefined | null,
	contentEn?: string | undefined | null,
	contentAr?: string | undefined | null,
	image?: ResolverInputTypes["Upload"] | undefined | null,
	url?: string | undefined | null,
	duration?: number | undefined | null,
	active?: boolean | undefined | null
};
	["AdvertisementOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	views?: ResolverInputTypes["OrderDirection"] | undefined | null,
	active?: ResolverInputTypes["OrderDirection"] | undefined | null,
	duration?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["AuthenticationResponse"]: AliasType<{
	authentication?:ResolverInputTypes["Authentication"],
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Authentication"]: AliasType<{
	user?:ResolverInputTypes["User"],
	token?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LoginInput"]: {
	email: ResolverInputTypes["EmailAddress"],
	password: string
};
	["CheckEmailInput"]: {
	email: ResolverInputTypes["EmailAddress"]
};
	["RegistrationInterpreterInput"]: {
	languages: Array<string>
};
	["VerifyRegistrationInput"]: {
	email: ResolverInputTypes["EmailAddress"],
	code: ResolverInputTypes["OTP"]
};
	["RegistrationInput"]: {
	firstName: string,
	lastName: string,
	cpr: string,
	email: ResolverInputTypes["EmailAddress"],
	dateOfBirth: ResolverInputTypes["Date"],
	language: string,
	country: string,
	city: string,
	mobile: ResolverInputTypes["PhoneNumber"],
	gender: ResolverInputTypes["Gender"],
	password: ResolverInputTypes["Password"],
	interpreter?: ResolverInputTypes["RegistrationInterpreterInput"] | undefined | null,
	acceptPrivacyPolicy: boolean,
	acceptTermsOfUse: boolean
};
	["RequestPasswordResetInput"]: {
	email: ResolverInputTypes["EmailAddress"]
};
	["VerifyPasswordResetInput"]: {
	email: ResolverInputTypes["EmailAddress"],
	code: ResolverInputTypes["OTP"]
};
	["ResetPasswordInput"]: {
	code: ResolverInputTypes["OTP"],
	email: ResolverInputTypes["EmailAddress"],
	password: ResolverInputTypes["Password"]
};
	["ChangePasswordInput"]: {
	currentPassword: string,
	newPassword: ResolverInputTypes["Password"]
};
	["CallStatus"]:CallStatus;
	["Call"]: AliasType<{
	id?:boolean | `@${string}`,
	from?:ResolverInputTypes["User"],
	to?:ResolverInputTypes["Interpreter"],
	token?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	service?:ResolverInputTypes["Service"],
	startedAt?:boolean | `@${string}`,
	endedAt?:boolean | `@${string}`,
	serviceCalledAt?:boolean | `@${string}`,
	serviceEndedAt?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CallWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["CallWhereInput"]: {
	AND?: Array<ResolverInputTypes["CallWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["CallWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["CallWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["StartCallWhereInput"]: {
	id: string
};
	["KeepCallAliveWhereInput"]: {
	id: string
};
	["KeepCallAliveData"]: {
	getToken?: boolean | undefined | null
};
	["EndCallInput"]: {
	id: string
};
	["CallOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["ConnectServiceInput"]: {
	id: string
};
	["Query"]: AliasType<{
	_empty?:boolean | `@${string}`,
	latestAbout?:ResolverInputTypes["About"],
about?: [{	where: ResolverInputTypes["AboutWhereUniqueInput"]},ResolverInputTypes["About"]],
abouts?: [{	where?: ResolverInputTypes["AboutWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["AboutOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["About"]],
aboutsCount?: [{	where?: ResolverInputTypes["AboutWhereInput"] | undefined | null},boolean | `@${string}`],
advertisement?: [{	where: ResolverInputTypes["AdvertisementWhereUniqueInput"]},ResolverInputTypes["Advertisement"]],
advertisements?: [{	where?: ResolverInputTypes["AdvertisementWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["AdvertisementOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["Advertisement"]],
advertisementsCount?: [{	where?: ResolverInputTypes["AdvertisementWhereInput"] | undefined | null},boolean | `@${string}`],
	activeAdvertisements?:ResolverInputTypes["Advertisement"],
login?: [{	data: ResolverInputTypes["LoginInput"]},ResolverInputTypes["AuthenticationResponse"]],
call?: [{	where: ResolverInputTypes["CallWhereUniqueInput"]},ResolverInputTypes["Call"]],
calls?: [{	where?: ResolverInputTypes["CallWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["CallOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["Call"]],
callsCount?: [{	where?: ResolverInputTypes["CallWhereInput"] | undefined | null},boolean | `@${string}`],
	outboundNumber?:boolean | `@${string}`,
frequentlyAskedQuestion?: [{	where: ResolverInputTypes["FrequentlyAskedQuestionWhereUniqueInput"]},ResolverInputTypes["FrequentlyAskedQuestion"]],
frequentlyAskedQuestions?: [{	where?: ResolverInputTypes["FrequentlyAskedQuestionWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["FrequentlyAskedQuestionOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["FrequentlyAskedQuestion"]],
frequentlyAskedQuestionsCount?: [{	where?: ResolverInputTypes["FrequentlyAskedQuestionWhereInput"] | undefined | null},boolean | `@${string}`],
interpreterRatingOption?: [{	where: ResolverInputTypes["InterpreterRatingOptionWhereUniqueInput"]},ResolverInputTypes["InterpreterRatingOption"]],
interpreterRatingOptions?: [{	where?: ResolverInputTypes["InterpreterRatingOptionWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["InterpreterRatingOptionOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["InterpreterRatingOption"]],
interpreterRatingOptionsCount?: [{	where?: ResolverInputTypes["InterpreterRatingOptionWhereInput"] | undefined | null},boolean | `@${string}`],
interpreterRating?: [{	where: ResolverInputTypes["InterpreterRatingWhereUniqueInput"]},ResolverInputTypes["InterpreterRating"]],
interpreterRatings?: [{	where?: ResolverInputTypes["InterpreterRatingWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["InterpreterRatingOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["InterpreterRating"]],
interpreterRatingsCount?: [{	where?: ResolverInputTypes["InterpreterRatingWhereInput"] | undefined | null},boolean | `@${string}`],
interpreter?: [{	where: ResolverInputTypes["InterpreterWhereUniqueInput"]},ResolverInputTypes["Interpreter"]],
interpreters?: [{	where?: ResolverInputTypes["InterpreterWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["InterpreterOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["Interpreter"]],
interpretersCount?: [{	where?: ResolverInputTypes["InterpreterWhereInput"] | undefined | null},boolean | `@${string}`],
	myAvailability?:boolean | `@${string}`,
	maintenanceMode?:ResolverInputTypes["MessageResponse"],
compareVersions?: [{	data: ResolverInputTypes["CompareVersionsInput"]},ResolverInputTypes["MessageResponse"]],
notification?: [{	where: ResolverInputTypes["NotificationWhereUniqueInput"]},ResolverInputTypes["Notification"]],
notifications?: [{	where?: ResolverInputTypes["NotificationWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["NotificationOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["Notification"]],
myNotifications?: [{	where?: ResolverInputTypes["NotificationWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["NotificationOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["Notification"]],
notificationsCount?: [{	where?: ResolverInputTypes["NotificationWhereInput"] | undefined | null},boolean | `@${string}`],
myNotificationsCount?: [{	where?: ResolverInputTypes["NotificationWhereInput"] | undefined | null},boolean | `@${string}`],
	latestPrivacyPolicy?:ResolverInputTypes["PrivacyPolicy"],
privacyPolicy?: [{	where: ResolverInputTypes["PrivacyPolicyWhereUniqueInput"]},ResolverInputTypes["PrivacyPolicy"]],
privacyPolicies?: [{	where?: ResolverInputTypes["PrivacyPolicyWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["PrivacyPolicyOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["PrivacyPolicy"]],
privacyPoliciesCount?: [{	where?: ResolverInputTypes["PrivacyPolicyWhereInput"] | undefined | null},boolean | `@${string}`],
serviceCategory?: [{	where: ResolverInputTypes["ServiceCategoryWhereUniqueInput"]},ResolverInputTypes["ServiceCategory"]],
serviceCategories?: [{	where?: ResolverInputTypes["ServiceCategoryWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["ServiceCategoryOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["ServiceCategory"]],
serviceCategoriesCount?: [{	where?: ResolverInputTypes["ServiceCategoryWhereInput"] | undefined | null},boolean | `@${string}`],
service?: [{	where: ResolverInputTypes["ServiceWhereUniqueInput"]},ResolverInputTypes["Service"]],
services?: [{	where?: ResolverInputTypes["ServiceWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["ServiceOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["Service"]],
servicesCount?: [{	where?: ResolverInputTypes["ServiceWhereInput"] | undefined | null},boolean | `@${string}`],
	latestTermsOfUse?:ResolverInputTypes["TermsOfUse"],
termsOfUse?: [{	where: ResolverInputTypes["TermsOfUseWhereUniqueInput"]},ResolverInputTypes["TermsOfUse"]],
termsOfUses?: [{	where?: ResolverInputTypes["TermsOfUseWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["TermsOfUseOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["TermsOfUse"]],
termsOfUsesCount?: [{	where?: ResolverInputTypes["TermsOfUseWhereInput"] | undefined | null},boolean | `@${string}`],
	myUser?:ResolverInputTypes["User"],
user?: [{	where: ResolverInputTypes["UserWhereUniqueInput"]},ResolverInputTypes["User"]],
users?: [{	where?: ResolverInputTypes["UserWhereInput"] | undefined | null,	orderBy?: Array<ResolverInputTypes["UserOrderByInput"]> | undefined | null,	take?: number | undefined | null,	skip?: number | undefined | null},ResolverInputTypes["User"]],
usersCount?: [{	where?: ResolverInputTypes["UserWhereInput"] | undefined | null},boolean | `@${string}`],
	myPreferences?:ResolverInputTypes["UserPreferences"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	_empty?:boolean | `@${string}`,
createAbout?: [{	data: ResolverInputTypes["AboutCreateInput"]},ResolverInputTypes["About"]],
updateAbout?: [{	where: ResolverInputTypes["AboutWhereUniqueInput"],	data: ResolverInputTypes["AboutUpdateInput"]},ResolverInputTypes["About"]],
deleteAbout?: [{	where: ResolverInputTypes["AboutWhereUniqueInput"]},ResolverInputTypes["About"]],
createAdvertisement?: [{	data: ResolverInputTypes["AdvertisementCreateInput"]},ResolverInputTypes["Advertisement"]],
updateAdvertisement?: [{	where: ResolverInputTypes["AdvertisementWhereUniqueInput"],	data: ResolverInputTypes["AdvertisementUpdateInput"]},ResolverInputTypes["Advertisement"]],
deleteAdvertisement?: [{	where: ResolverInputTypes["AdvertisementWhereUniqueInput"]},ResolverInputTypes["Advertisement"]],
activateAdvertisement?: [{	where: ResolverInputTypes["AdvertisementWhereUniqueInput"]},ResolverInputTypes["Advertisement"]],
register?: [{	data: ResolverInputTypes["RegistrationInput"]},ResolverInputTypes["MessageResponse"]],
verifyRegistration?: [{	data: ResolverInputTypes["VerifyRegistrationInput"]},ResolverInputTypes["AuthenticationResponse"]],
requestPasswordReset?: [{	data: ResolverInputTypes["RequestPasswordResetInput"]},ResolverInputTypes["MessageResponse"]],
verifyPasswordReset?: [{	data: ResolverInputTypes["VerifyPasswordResetInput"]},ResolverInputTypes["MessageResponse"]],
resetPassword?: [{	data: ResolverInputTypes["ResetPasswordInput"]},ResolverInputTypes["AuthenticationResponse"]],
changePassword?: [{	data: ResolverInputTypes["ChangePasswordInput"]},ResolverInputTypes["MessageResponse"]],
	activeCall?:ResolverInputTypes["Call"],
startCall?: [{	where: ResolverInputTypes["StartCallWhereInput"]},ResolverInputTypes["Call"]],
	endCall?:ResolverInputTypes["Call"],
keepCallAlive?: [{	where: ResolverInputTypes["KeepCallAliveWhereInput"],	data: ResolverInputTypes["KeepCallAliveData"]},ResolverInputTypes["Call"]],
	answerCall?:ResolverInputTypes["Call"],
	rejectCall?:ResolverInputTypes["Call"],
connectService?: [{	data: ResolverInputTypes["ConnectServiceInput"]},ResolverInputTypes["Call"]],
	disconnectService?:ResolverInputTypes["Call"],
createFrequentlyAskedQuestion?: [{	data: ResolverInputTypes["FrequentlyAskedQuestionCreateInput"]},ResolverInputTypes["FrequentlyAskedQuestion"]],
updateFrequentlyAskedQuestion?: [{	where: ResolverInputTypes["FrequentlyAskedQuestionWhereUniqueInput"],	data: ResolverInputTypes["FrequentlyAskedQuestionUpdateInput"]},ResolverInputTypes["FrequentlyAskedQuestion"]],
deleteFrequentlyAskedQuestion?: [{	where: ResolverInputTypes["FrequentlyAskedQuestionWhereUniqueInput"]},ResolverInputTypes["FrequentlyAskedQuestion"]],
createInterpreterRatingOption?: [{	data: ResolverInputTypes["InterpreterRatingOptionCreateInput"]},ResolverInputTypes["InterpreterRatingOption"]],
updateInterpreterRatingOption?: [{	where: ResolverInputTypes["InterpreterRatingOptionWhereUniqueInput"],	data: ResolverInputTypes["InterpreterRatingOptionUpdateInput"]},ResolverInputTypes["InterpreterRatingOption"]],
deleteInterpreterRatingOption?: [{	where: ResolverInputTypes["InterpreterRatingOptionWhereUniqueInput"]},ResolverInputTypes["InterpreterRatingOption"]],
createInterpreterRating?: [{	data: ResolverInputTypes["InterpreterRatingCreateInput"]},ResolverInputTypes["InterpreterRating"]],
updateInterpreterRating?: [{	where: ResolverInputTypes["InterpreterRatingWhereUniqueInput"],	data: ResolverInputTypes["InterpreterRatingUpdateInput"]},ResolverInputTypes["InterpreterRating"]],
deleteInterpreterRating?: [{	where: ResolverInputTypes["InterpreterRatingWhereUniqueInput"]},ResolverInputTypes["InterpreterRating"]],
approveInterpreter?: [{	where: ResolverInputTypes["InterpreterWhereUniqueInput"]},ResolverInputTypes["Interpreter"]],
rejectInterpreter?: [{	where: ResolverInputTypes["InterpreterWhereUniqueInput"]},ResolverInputTypes["Interpreter"]],
updateInterpreter?: [{	where: ResolverInputTypes["InterpreterWhereUniqueInput"],	data: ResolverInputTypes["InterpreterUpdateInput"]},ResolverInputTypes["Interpreter"]],
updateMyInterpreter?: [{	data: ResolverInputTypes["MyInterpreterUpdateInput"]},ResolverInputTypes["Interpreter"]],
	toggleInterpreterAvailability?:boolean | `@${string}`,
toggleFavoriteInterpreter?: [{	where: ResolverInputTypes["InterpreterWhereUniqueInput"]},boolean | `@${string}`],
	toggleMaintenanceMode?:ResolverInputTypes["MessageResponse"],
submitExpoToken?: [{	data: ResolverInputTypes["SubmitExpoTokenInput"]},ResolverInputTypes["MessageResponse"]],
sendNotification?: [{	data: ResolverInputTypes["SendNotificationInput"]},ResolverInputTypes["MessageResponse"]],
createNotification?: [{	data: ResolverInputTypes["NotificationCreateInput"]},ResolverInputTypes["Notification"]],
updateNotification?: [{	where: ResolverInputTypes["NotificationWhereUniqueInput"],	data: ResolverInputTypes["NotificationUpdateInput"]},ResolverInputTypes["Notification"]],
deleteNotification?: [{	where: ResolverInputTypes["NotificationWhereUniqueInput"]},ResolverInputTypes["Notification"]],
createPrivacyPolicy?: [{	data: ResolverInputTypes["PrivacyPolicyCreateInput"]},ResolverInputTypes["PrivacyPolicy"]],
updatePrivacyPolicy?: [{	where: ResolverInputTypes["PrivacyPolicyWhereUniqueInput"],	data: ResolverInputTypes["PrivacyPolicyUpdateInput"]},ResolverInputTypes["PrivacyPolicy"]],
deletePrivacyPolicy?: [{	where: ResolverInputTypes["PrivacyPolicyWhereUniqueInput"]},ResolverInputTypes["PrivacyPolicy"]],
acceptPrivacyPolicy?: [{	where: ResolverInputTypes["PrivacyPolicyWhereUniqueInput"]},ResolverInputTypes["PrivacyPolicyAcceptance"]],
createServiceCategory?: [{	data: ResolverInputTypes["ServiceCategoryCreateInput"]},ResolverInputTypes["ServiceCategory"]],
updateServiceCategory?: [{	where: ResolverInputTypes["ServiceCategoryWhereUniqueInput"],	data: ResolverInputTypes["ServiceCategoryUpdateInput"]},ResolverInputTypes["ServiceCategory"]],
deleteServiceCategory?: [{	where: ResolverInputTypes["ServiceCategoryWhereUniqueInput"]},ResolverInputTypes["ServiceCategory"]],
createService?: [{	data: ResolverInputTypes["ServiceCreateInput"]},ResolverInputTypes["Service"]],
updateService?: [{	where: ResolverInputTypes["ServiceWhereUniqueInput"],	data: ResolverInputTypes["ServiceUpdateInput"]},ResolverInputTypes["Service"]],
deleteService?: [{	where: ResolverInputTypes["ServiceWhereUniqueInput"]},ResolverInputTypes["Service"]],
createTermsOfUse?: [{	data: ResolverInputTypes["TermsOfUseCreateInput"]},ResolverInputTypes["TermsOfUse"]],
updateTermsOfUse?: [{	where: ResolverInputTypes["TermsOfUseWhereUniqueInput"],	data: ResolverInputTypes["TermsOfUseUpdateInput"]},ResolverInputTypes["TermsOfUse"]],
deleteTermsOfUse?: [{	where: ResolverInputTypes["TermsOfUseWhereUniqueInput"]},ResolverInputTypes["TermsOfUse"]],
acceptTermsOfUse?: [{	where: ResolverInputTypes["TermsOfUseWhereUniqueInput"]},ResolverInputTypes["TermsOfUseAcceptance"]],
createUser?: [{	data: ResolverInputTypes["UserCreateInput"]},ResolverInputTypes["User"]],
updateMyUser?: [{	data: ResolverInputTypes["MyUserUpdateInput"]},ResolverInputTypes["User"]],
updateUser?: [{	where: ResolverInputTypes["UserWhereUniqueInput"],	data: ResolverInputTypes["UserUpdateInput"]},ResolverInputTypes["User"]],
deleteMyUser?: [{	data: ResolverInputTypes["MyUserDeleteInput"]},ResolverInputTypes["User"]],
deleteUser?: [{	where: ResolverInputTypes["UserWhereUniqueInput"]},ResolverInputTypes["User"]],
updateMyPreferences?: [{	data: ResolverInputTypes["MyUserPreferencesUpdateInput"]},ResolverInputTypes["UserPreferences"]],
		__typename?: boolean | `@${string}`
}>;
	["IDFilter"]: {
	equals?: string | undefined | null,
	in?: Array<string> | undefined | null,
	notIn?: Array<string> | undefined | null,
	lt?: string | undefined | null,
	lte?: string | undefined | null,
	gt?: string | undefined | null,
	gte?: string | undefined | null,
	not?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["RelationshipNullableFilter"]: {
	id?: string | undefined | null,
	is?: ResolverInputTypes["Null"] | undefined | null,
	isNot?: ResolverInputTypes["Null"] | undefined | null
};
	["ArrayNullableFilter"]: {
	equals?: Array<string> | undefined | null,
	hasSome?: Array<string> | undefined | null,
	hasEvery?: Array<string> | undefined | null,
	has?: string | undefined | null,
	isEmpty?: boolean | undefined | null
};
	["StringNullableFilter"]: {
	equals?: string | undefined | null,
	in?: Array<string> | undefined | null,
	notIn?: Array<string> | undefined | null,
	lt?: string | undefined | null,
	lte?: string | undefined | null,
	gt?: string | undefined | null,
	gte?: string | undefined | null,
	contains?: string | undefined | null,
	startsWith?: string | undefined | null,
	endsWith?: string | undefined | null,
	mode?: ResolverInputTypes["QueryMode"] | undefined | null,
	not?: ResolverInputTypes["NestedStringNullableFilter"] | undefined | null
};
	["NestedStringNullableFilter"]: {
	equals?: string | undefined | null,
	in?: Array<string> | undefined | null,
	notIn?: Array<string> | undefined | null,
	lt?: string | undefined | null,
	lte?: string | undefined | null,
	gt?: string | undefined | null,
	gte?: string | undefined | null,
	contains?: string | undefined | null,
	startsWith?: string | undefined | null,
	endsWith?: string | undefined | null,
	not?: ResolverInputTypes["NestedStringNullableFilter"] | undefined | null
};
	["IntNullableFilter"]: {
	equals?: number | undefined | null,
	in?: Array<number> | undefined | null,
	notIn?: Array<number> | undefined | null,
	lt?: number | undefined | null,
	lte?: number | undefined | null,
	gt?: number | undefined | null,
	gte?: number | undefined | null,
	not?: ResolverInputTypes["NestedIntNullableFilter"] | undefined | null
};
	["NestedIntNullableFilter"]: {
	equals?: number | undefined | null,
	in?: Array<number> | undefined | null,
	notIn?: Array<number> | undefined | null,
	lt?: number | undefined | null,
	lte?: number | undefined | null,
	gt?: number | undefined | null,
	gte?: number | undefined | null,
	not?: ResolverInputTypes["NestedIntNullableFilter"] | undefined | null
};
	["FloatNullableFilter"]: {
	equals?: number | undefined | null,
	in?: Array<number> | undefined | null,
	notIn?: Array<number> | undefined | null,
	lt?: number | undefined | null,
	lte?: number | undefined | null,
	gt?: number | undefined | null,
	gte?: number | undefined | null,
	not?: ResolverInputTypes["NestedFloatNullableFilter"] | undefined | null
};
	["NestedFloatNullableFilter"]: {
	equals?: number | undefined | null,
	in?: Array<number> | undefined | null,
	notIn?: Array<number> | undefined | null,
	lt?: number | undefined | null,
	lte?: number | undefined | null,
	gt?: number | undefined | null,
	gte?: number | undefined | null,
	not?: ResolverInputTypes["NestedFloatNullableFilter"] | undefined | null
};
	["QueryMode"]:QueryMode;
	["OrderDirection"]:OrderDirection;
	["BatchPayload"]: AliasType<{
	count?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Gender"]:Gender;
	["MessageResponse"]: AliasType<{
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["FrequentlyAskedQuestion"]: AliasType<{
	id?:boolean | `@${string}`,
	question?:boolean | `@${string}`,
	questionEn?:boolean | `@${string}`,
	questionAr?:boolean | `@${string}`,
	answer?:boolean | `@${string}`,
	answerEn?:boolean | `@${string}`,
	answerAr?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["FrequentlyAskedQuestionWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["FrequentlyAskedQuestionWhereInput"]: {
	AND?: Array<ResolverInputTypes["FrequentlyAskedQuestionWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["FrequentlyAskedQuestionWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["FrequentlyAskedQuestionWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["FrequentlyAskedQuestionCreateInput"]: {
	questionEn: string,
	questionAr?: string | undefined | null,
	answerEn: string,
	answerAr?: string | undefined | null
};
	["FrequentlyAskedQuestionUpdateInput"]: {
	questionEn?: string | undefined | null,
	questionAr?: string | undefined | null,
	answerEn?: string | undefined | null,
	answerAr?: string | undefined | null
};
	["FrequentlyAskedQuestionOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["InterpreterRatingOption"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	ratingVisibleFrom?:boolean | `@${string}`,
	ratingVisibleTo?:boolean | `@${string}`,
	ratings?:ResolverInputTypes["InterpreterRating"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["InterpreterRatingOptionWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["InterpreterRatingOptionWhereInput"]: {
	AND?: Array<ResolverInputTypes["InterpreterRatingOptionWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["InterpreterRatingOptionWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["InterpreterRatingOptionWhereInput"]> | undefined | null,
	ratingVisibleFrom?: ResolverInputTypes["FloatNullableFilter"] | undefined | null,
	ratingVisibleTo?: ResolverInputTypes["FloatNullableFilter"] | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["InterpreterRatingOptionCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined | null,
	ratingVisibleFrom: number,
	ratingVisibleTo: number
};
	["InterpreterRatingOptionUpdateInput"]: {
	titleEn?: string | undefined | null,
	titleAr?: string | undefined | null,
	ratingVisibleFrom?: number | undefined | null,
	ratingVisibleTo?: number | undefined | null
};
	["InterpreterRatingOptionOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["InterpreterRating"]: AliasType<{
	id?:boolean | `@${string}`,
	rating?:boolean | `@${string}`,
	options?:ResolverInputTypes["InterpreterRatingOption"],
	tellUsMore?:boolean | `@${string}`,
	ip?:boolean | `@${string}`,
	interpreter?:ResolverInputTypes["Interpreter"],
	user?:ResolverInputTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["InterpreterRatingWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["InterpreterRatingWhereInput"]: {
	AND?: Array<ResolverInputTypes["InterpreterRatingWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["InterpreterRatingWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["InterpreterRatingWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["InterpreterRatingCreateInput"]: {
	interpreter: string,
	rating: number,
	tellUsMore?: string | undefined | null,
	options: Array<string>
};
	["InterpreterRatingUpdateInput"]: {
	interpreter?: string | undefined | null,
	rating?: number | undefined | null,
	tellUsMore?: string | undefined | null,
	options?: Array<string> | undefined | null
};
	["InterpreterRatingOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["InterpreterStatus"]:InterpreterStatus;
	["InterpreterUser"]: AliasType<{
	id?:boolean | `@${string}`,
	firstName?:boolean | `@${string}`,
	lastName?:boolean | `@${string}`,
	fullName?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Interpreter"]: AliasType<{
	id?:boolean | `@${string}`,
	languages?:boolean | `@${string}`,
	ratings?:ResolverInputTypes["InterpreterRating"],
	rating?:boolean | `@${string}`,
	user?:ResolverInputTypes["InterpreterUser"],
	online?:boolean | `@${string}`,
	approved?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	isBusy?:boolean | `@${string}`,
	isFavorite?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["InterpreterWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["InterpreterWhereInput"]: {
	AND?: Array<ResolverInputTypes["InterpreterWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["InterpreterWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["InterpreterWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["InterpreterUpdateInput"]: {
	languages?: Array<string> | undefined | null,
	status?: ResolverInputTypes["InterpreterStatus"] | undefined | null
};
	["MyInterpreterUpdateInput"]: {
	languages?: Array<string> | undefined | null
};
	["InterpreterOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	approved?: ResolverInputTypes["OrderDirection"] | undefined | null,
	online?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["SubmitExpoTokenInput"]: {
	token: string
};
	["CompareVersionsInput"]: {
	version: string
};
	["SendNotificationInput"]: {
	title: string,
	body: string,
	test?: boolean | undefined | null
};
	["Notification"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	message?:boolean | `@${string}`,
	messageEn?:boolean | `@${string}`,
	messageAr?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["NotificationWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["NotificationWhereInput"]: {
	AND?: Array<ResolverInputTypes["NotificationWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["NotificationWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["NotificationWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["NotificationCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined | null,
	messageEn: string,
	messageAr?: string | undefined | null
};
	["NotificationUpdateInput"]: {
	titleEn?: string | undefined | null,
	titleAr?: string | undefined | null,
	messageEn?: string | undefined | null,
	messageAr?: string | undefined | null
};
	["NotificationOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["PrivacyPolicyAcceptance"]: AliasType<{
	id?:boolean | `@${string}`,
	privacyPolicy?:ResolverInputTypes["PrivacyPolicy"],
	user?:ResolverInputTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PrivacyPolicy"]: AliasType<{
	id?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	version?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PrivacyPolicyWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["PrivacyPolicyWhereInput"]: {
	AND?: Array<ResolverInputTypes["PrivacyPolicyWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["PrivacyPolicyWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["PrivacyPolicyWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["PrivacyPolicyCreateInput"]: {
	contentEn: string,
	contentAr?: string | undefined | null
};
	["PrivacyPolicyUpdateInput"]: {
	contentEn?: string | undefined | null,
	contentAr?: string | undefined | null
};
	["PrivacyPolicyOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["Upload"]:unknown;
	["Date"]: Date;
	["Null"]:unknown;
	["NullableString"]:unknown;
	["NullableNumber"]:unknown;
	["NullableID"]:unknown;
	["UntrimmedString"]:unknown;
	["LowercaseString"]:unknown;
	["UppercaseString"]:unknown;
	["EmailAddress"]:unknown;
	["Password"]:unknown;
	["OTP"]:unknown;
	["PhoneNumber"]:unknown;
	["ServiceCategory"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	titleEn?:boolean | `@${string}`,
	titleAr?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	services?:ResolverInputTypes["Service"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ServiceCategoryWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["ServiceCategoryWhereInput"]: {
	AND?: Array<ResolverInputTypes["ServiceCategoryWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["ServiceCategoryWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["ServiceCategoryWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["ServiceCategoryCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined | null,
	image: ResolverInputTypes["Upload"]
};
	["ServiceCategoryUpdateInput"]: {
	titleEn?: string | undefined | null,
	titleAr?: string | undefined | null,
	image?: ResolverInputTypes["Upload"] | undefined | null
};
	["ServiceCategoryOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	titleEn?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["Service"]: AliasType<{
	id?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	nameEn?:boolean | `@${string}`,
	nameAr?:boolean | `@${string}`,
	description?:boolean | `@${string}`,
	descriptionEn?:boolean | `@${string}`,
	descriptionAr?:boolean | `@${string}`,
	phone?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	category?:ResolverInputTypes["ServiceCategory"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ServiceWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["ServiceWhereInput"]: {
	AND?: Array<ResolverInputTypes["ServiceWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["ServiceWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["ServiceWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["ServiceCreateInput"]: {
	nameEn: string,
	nameAr?: string | undefined | null,
	descriptionEn: string,
	descriptionAr?: string | undefined | null,
	phone: ResolverInputTypes["PhoneNumber"],
	image: ResolverInputTypes["Upload"],
	categoryId: string
};
	["ServiceUpdateInput"]: {
	nameEn?: string | undefined | null,
	nameAr?: string | undefined | null,
	descriptionEn?: string | undefined | null,
	descriptionAr?: string | undefined | null,
	phone?: ResolverInputTypes["PhoneNumber"] | undefined | null,
	image?: ResolverInputTypes["Upload"] | undefined | null,
	categoryId?: string | undefined | null
};
	["ServiceOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["TermsOfUseAcceptance"]: AliasType<{
	id?:boolean | `@${string}`,
	termsOfUse?:ResolverInputTypes["TermsOfUse"],
	user?:ResolverInputTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["TermsOfUse"]: AliasType<{
	id?:boolean | `@${string}`,
	content?:boolean | `@${string}`,
	contentEn?:boolean | `@${string}`,
	contentAr?:boolean | `@${string}`,
	version?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["TermsOfUseWhereUniqueInput"]: {
	id?: string | undefined | null
};
	["TermsOfUseWhereInput"]: {
	AND?: Array<ResolverInputTypes["TermsOfUseWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["TermsOfUseWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["TermsOfUseWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null
};
	["TermsOfUseCreateInput"]: {
	contentEn: string,
	contentAr: string
};
	["TermsOfUseUpdateInput"]: {
	contentEn?: string | undefined | null,
	contentAr?: string | undefined | null
};
	["TermsOfUseOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["UserPreferences"]: AliasType<{
	id?:boolean | `@${string}`,
	emailNotifications?:boolean | `@${string}`,
	smsNotifications?:boolean | `@${string}`,
	pushNotifications?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["UserRole"]:UserRole;
	["User"]: AliasType<{
	id?:boolean | `@${string}`,
	firstName?:boolean | `@${string}`,
	lastName?:boolean | `@${string}`,
	fullName?:boolean | `@${string}`,
	cpr?:boolean | `@${string}`,
	email?:boolean | `@${string}`,
	dateOfBirth?:boolean | `@${string}`,
	language?:boolean | `@${string}`,
	country?:boolean | `@${string}`,
	city?:boolean | `@${string}`,
	mobile?:boolean | `@${string}`,
	gender?:boolean | `@${string}`,
	role?:boolean | `@${string}`,
	image?:boolean | `@${string}`,
	preferences?:ResolverInputTypes["UserPreferences"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["UserWhereUniqueInput"]: {
	id?: string | undefined | null,
	email?: ResolverInputTypes["EmailAddress"] | undefined | null
};
	["UserRoleNullableFilter"]: {
	equals?: ResolverInputTypes["UserRole"] | undefined | null,
	in?: Array<ResolverInputTypes["UserRole"]> | undefined | null,
	notIn?: Array<ResolverInputTypes["UserRole"]> | undefined | null
};
	["UserWhereInput"]: {
	AND?: Array<ResolverInputTypes["UserWhereInput"]> | undefined | null,
	OR?: Array<ResolverInputTypes["UserWhereInput"]> | undefined | null,
	NOT?: Array<ResolverInputTypes["UserWhereInput"]> | undefined | null,
	id?: ResolverInputTypes["IDFilter"] | undefined | null,
	firstName?: ResolverInputTypes["StringNullableFilter"] | undefined | null,
	lastName?: ResolverInputTypes["StringNullableFilter"] | undefined | null,
	email?: ResolverInputTypes["StringNullableFilter"] | undefined | null,
	role?: ResolverInputTypes["UserRoleNullableFilter"] | undefined | null
};
	["UserCreateInput"]: {
	firstName: string,
	lastName: string,
	cpr: string,
	email: ResolverInputTypes["EmailAddress"],
	dateOfBirth: ResolverInputTypes["Date"],
	language: ResolverInputTypes["UppercaseString"],
	country: string,
	city: string,
	mobile: ResolverInputTypes["PhoneNumber"],
	gender: ResolverInputTypes["Gender"],
	password: ResolverInputTypes["Password"],
	role?: ResolverInputTypes["UserRole"] | undefined | null,
	image?: ResolverInputTypes["Upload"] | undefined | null
};
	["UserUpdateInput"]: {
	firstName?: string | undefined | null,
	lastName?: string | undefined | null,
	cpr?: string | undefined | null,
	email?: ResolverInputTypes["EmailAddress"] | undefined | null,
	dateOfBirth?: ResolverInputTypes["Date"] | undefined | null,
	language?: ResolverInputTypes["UppercaseString"] | undefined | null,
	country?: string | undefined | null,
	city?: string | undefined | null,
	mobile?: ResolverInputTypes["PhoneNumber"] | undefined | null,
	gender?: ResolverInputTypes["Gender"] | undefined | null,
	password?: ResolverInputTypes["Password"] | undefined | null,
	role?: ResolverInputTypes["UserRole"] | undefined | null,
	image?: ResolverInputTypes["Upload"] | undefined | null
};
	["MyUserUpdateInput"]: {
	firstName?: string | undefined | null,
	lastName?: string | undefined | null,
	cpr?: string | undefined | null,
	email?: ResolverInputTypes["EmailAddress"] | undefined | null,
	dateOfBirth?: ResolverInputTypes["Date"] | undefined | null,
	language?: ResolverInputTypes["UppercaseString"] | undefined | null,
	country?: string | undefined | null,
	city?: string | undefined | null,
	mobile?: ResolverInputTypes["PhoneNumber"] | undefined | null,
	gender?: ResolverInputTypes["Gender"] | undefined | null,
	image?: ResolverInputTypes["Upload"] | undefined | null
};
	["MyUserPreferencesUpdateInput"]: {
	emailNotifications?: boolean | undefined | null,
	smsNotifications?: boolean | undefined | null,
	pushNotifications?: boolean | undefined | null
};
	["MyUserDeleteInput"]: {
	password: string
};
	["UserOrderByInput"]: {
	id?: ResolverInputTypes["OrderDirection"] | undefined | null,
	firstName?: ResolverInputTypes["OrderDirection"] | undefined | null,
	lastName?: ResolverInputTypes["OrderDirection"] | undefined | null,
	email?: ResolverInputTypes["OrderDirection"] | undefined | null,
	role?: ResolverInputTypes["OrderDirection"] | undefined | null,
	createdAt?: ResolverInputTypes["OrderDirection"] | undefined | null
};
	["UserFilter"]: {
	firstName?: string | undefined | null,
	lastName?: string | undefined | null,
	email?: ResolverInputTypes["EmailAddress"] | undefined | null,
	role?: ResolverInputTypes["UserRole"] | undefined | null
}
  }

export type ModelTypes = {
    ["About"]: {
		id: string,
	content?: string | undefined,
	contentEn: string,
	contentAr?: string | undefined,
	version: number,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["AboutWhereUniqueInput"]: {
	id?: string | undefined
};
	["AboutWhereInput"]: {
	AND?: Array<ModelTypes["AboutWhereInput"]> | undefined,
	OR?: Array<ModelTypes["AboutWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["AboutWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["AboutCreateInput"]: {
	contentEn: string,
	contentAr?: string | undefined
};
	["AboutUpdateInput"]: {
	contentEn?: string | undefined,
	contentAr?: string | undefined
};
	["AboutOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["Advertisement"]: {
		id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	content: string,
	contentEn: string,
	contentAr?: string | undefined,
	image: string,
	url?: string | undefined,
	duration: number,
	active: boolean,
	views: number,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["AdvertisementWhereUniqueInput"]: {
	id?: string | undefined
};
	["AdvertisementWhereInput"]: {
	AND?: Array<ModelTypes["AdvertisementWhereInput"]> | undefined,
	OR?: Array<ModelTypes["AdvertisementWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["AdvertisementWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["AdvertisementCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined,
	contentEn: string,
	contentAr?: string | undefined,
	image: ModelTypes["Upload"],
	url: string,
	duration: number,
	active: boolean
};
	["AdvertisementUpdateInput"]: {
	titleEn?: string | undefined,
	titleAr?: string | undefined,
	contentEn?: string | undefined,
	contentAr?: string | undefined,
	image?: ModelTypes["Upload"] | undefined,
	url?: string | undefined,
	duration?: number | undefined,
	active?: boolean | undefined
};
	["AdvertisementOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	views?: ModelTypes["OrderDirection"] | undefined,
	active?: ModelTypes["OrderDirection"] | undefined,
	duration?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["AuthenticationResponse"]: {
		authentication?: ModelTypes["Authentication"] | undefined,
	message?: string | undefined
};
	["Authentication"]: {
		user: ModelTypes["User"],
	token: string
};
	["LoginInput"]: {
	email: ModelTypes["EmailAddress"],
	password: string
};
	["CheckEmailInput"]: {
	email: ModelTypes["EmailAddress"]
};
	["RegistrationInterpreterInput"]: {
	languages: Array<string>
};
	["VerifyRegistrationInput"]: {
	email: ModelTypes["EmailAddress"],
	code: ModelTypes["OTP"]
};
	["RegistrationInput"]: {
	firstName: string,
	lastName: string,
	cpr: string,
	email: ModelTypes["EmailAddress"],
	dateOfBirth: ModelTypes["Date"],
	language: string,
	country: string,
	city: string,
	mobile: ModelTypes["PhoneNumber"],
	gender: ModelTypes["Gender"],
	password: ModelTypes["Password"],
	interpreter?: ModelTypes["RegistrationInterpreterInput"] | undefined,
	acceptPrivacyPolicy: boolean,
	acceptTermsOfUse: boolean
};
	["RequestPasswordResetInput"]: {
	email: ModelTypes["EmailAddress"]
};
	["VerifyPasswordResetInput"]: {
	email: ModelTypes["EmailAddress"],
	code: ModelTypes["OTP"]
};
	["ResetPasswordInput"]: {
	code: ModelTypes["OTP"],
	email: ModelTypes["EmailAddress"],
	password: ModelTypes["Password"]
};
	["ChangePasswordInput"]: {
	currentPassword: string,
	newPassword: ModelTypes["Password"]
};
	["CallStatus"]:CallStatus;
	["Call"]: {
		id: string,
	from: ModelTypes["User"],
	to: ModelTypes["Interpreter"],
	token?: string | undefined,
	status: ModelTypes["CallStatus"],
	service?: ModelTypes["Service"] | undefined,
	startedAt?: ModelTypes["Date"] | undefined,
	endedAt?: ModelTypes["Date"] | undefined,
	serviceCalledAt?: ModelTypes["Date"] | undefined,
	serviceEndedAt?: ModelTypes["Date"] | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["CallWhereUniqueInput"]: {
	id?: string | undefined
};
	["CallWhereInput"]: {
	AND?: Array<ModelTypes["CallWhereInput"]> | undefined,
	OR?: Array<ModelTypes["CallWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["CallWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["StartCallWhereInput"]: {
	id: string
};
	["KeepCallAliveWhereInput"]: {
	id: string
};
	["KeepCallAliveData"]: {
	getToken?: boolean | undefined
};
	["EndCallInput"]: {
	id: string
};
	["CallOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["ConnectServiceInput"]: {
	id: string
};
	["Query"]: {
		_empty?: string | undefined,
	latestAbout: ModelTypes["About"],
	about: ModelTypes["About"],
	abouts: Array<ModelTypes["About"]>,
	aboutsCount: number,
	advertisement?: ModelTypes["Advertisement"] | undefined,
	advertisements: Array<ModelTypes["Advertisement"]>,
	advertisementsCount: number,
	activeAdvertisements: Array<ModelTypes["Advertisement"]>,
	login: ModelTypes["AuthenticationResponse"],
	call: ModelTypes["Call"],
	calls: Array<ModelTypes["Call"]>,
	callsCount: number,
	outboundNumber: string,
	frequentlyAskedQuestion: ModelTypes["FrequentlyAskedQuestion"],
	frequentlyAskedQuestions: Array<ModelTypes["FrequentlyAskedQuestion"]>,
	frequentlyAskedQuestionsCount: number,
	interpreterRatingOption: ModelTypes["InterpreterRatingOption"],
	interpreterRatingOptions: Array<ModelTypes["InterpreterRatingOption"]>,
	interpreterRatingOptionsCount: number,
	interpreterRating: ModelTypes["InterpreterRating"],
	interpreterRatings: Array<ModelTypes["InterpreterRating"]>,
	interpreterRatingsCount: number,
	interpreter: ModelTypes["Interpreter"],
	interpreters: Array<ModelTypes["Interpreter"]>,
	interpretersCount: number,
	myAvailability: boolean,
	maintenanceMode: ModelTypes["MessageResponse"],
	compareVersions: ModelTypes["MessageResponse"],
	notification: ModelTypes["Notification"],
	notifications: Array<ModelTypes["Notification"]>,
	myNotifications: Array<ModelTypes["Notification"]>,
	notificationsCount: number,
	myNotificationsCount: number,
	latestPrivacyPolicy: ModelTypes["PrivacyPolicy"],
	privacyPolicy: ModelTypes["PrivacyPolicy"],
	privacyPolicies: Array<ModelTypes["PrivacyPolicy"]>,
	privacyPoliciesCount: number,
	serviceCategory: ModelTypes["ServiceCategory"],
	serviceCategories: Array<ModelTypes["ServiceCategory"]>,
	serviceCategoriesCount: number,
	service: ModelTypes["Service"],
	services: Array<ModelTypes["Service"]>,
	servicesCount: number,
	latestTermsOfUse: ModelTypes["TermsOfUse"],
	termsOfUse: ModelTypes["TermsOfUse"],
	termsOfUses: Array<ModelTypes["TermsOfUse"]>,
	termsOfUsesCount: number,
	myUser: ModelTypes["User"],
	user: ModelTypes["User"],
	users: Array<ModelTypes["User"]>,
	usersCount: number,
	myPreferences: ModelTypes["UserPreferences"]
};
	["Mutation"]: {
		_empty?: string | undefined,
	createAbout: ModelTypes["About"],
	updateAbout: ModelTypes["About"],
	deleteAbout: ModelTypes["About"],
	createAdvertisement: ModelTypes["Advertisement"],
	updateAdvertisement: ModelTypes["Advertisement"],
	deleteAdvertisement: ModelTypes["Advertisement"],
	activateAdvertisement: ModelTypes["Advertisement"],
	register: ModelTypes["MessageResponse"],
	verifyRegistration: ModelTypes["AuthenticationResponse"],
	requestPasswordReset: ModelTypes["MessageResponse"],
	verifyPasswordReset: ModelTypes["MessageResponse"],
	resetPassword: ModelTypes["AuthenticationResponse"],
	changePassword: ModelTypes["MessageResponse"],
	activeCall?: ModelTypes["Call"] | undefined,
	startCall: ModelTypes["Call"],
	endCall: ModelTypes["Call"],
	keepCallAlive: ModelTypes["Call"],
	answerCall: ModelTypes["Call"],
	rejectCall: ModelTypes["Call"],
	connectService: ModelTypes["Call"],
	disconnectService: ModelTypes["Call"],
	createFrequentlyAskedQuestion: ModelTypes["FrequentlyAskedQuestion"],
	updateFrequentlyAskedQuestion: ModelTypes["FrequentlyAskedQuestion"],
	deleteFrequentlyAskedQuestion: ModelTypes["FrequentlyAskedQuestion"],
	createInterpreterRatingOption: ModelTypes["InterpreterRatingOption"],
	updateInterpreterRatingOption: ModelTypes["InterpreterRatingOption"],
	deleteInterpreterRatingOption: ModelTypes["InterpreterRatingOption"],
	createInterpreterRating: ModelTypes["InterpreterRating"],
	updateInterpreterRating: ModelTypes["InterpreterRating"],
	deleteInterpreterRating: ModelTypes["InterpreterRating"],
	approveInterpreter: ModelTypes["Interpreter"],
	rejectInterpreter: ModelTypes["Interpreter"],
	updateInterpreter: ModelTypes["Interpreter"],
	updateMyInterpreter: ModelTypes["Interpreter"],
	toggleInterpreterAvailability: boolean,
	toggleFavoriteInterpreter: boolean,
	toggleMaintenanceMode: ModelTypes["MessageResponse"],
	submitExpoToken: ModelTypes["MessageResponse"],
	sendNotification: ModelTypes["MessageResponse"],
	createNotification: ModelTypes["Notification"],
	updateNotification: ModelTypes["Notification"],
	deleteNotification: ModelTypes["Notification"],
	createPrivacyPolicy: ModelTypes["PrivacyPolicy"],
	updatePrivacyPolicy: ModelTypes["PrivacyPolicy"],
	deletePrivacyPolicy: ModelTypes["PrivacyPolicy"],
	acceptPrivacyPolicy: ModelTypes["PrivacyPolicyAcceptance"],
	createServiceCategory: ModelTypes["ServiceCategory"],
	updateServiceCategory: ModelTypes["ServiceCategory"],
	deleteServiceCategory: ModelTypes["ServiceCategory"],
	createService: ModelTypes["Service"],
	updateService: ModelTypes["Service"],
	deleteService: ModelTypes["Service"],
	createTermsOfUse: ModelTypes["TermsOfUse"],
	updateTermsOfUse: ModelTypes["TermsOfUse"],
	deleteTermsOfUse: ModelTypes["TermsOfUse"],
	acceptTermsOfUse: ModelTypes["TermsOfUseAcceptance"],
	createUser: ModelTypes["User"],
	updateMyUser: ModelTypes["User"],
	updateUser: ModelTypes["User"],
	deleteMyUser: ModelTypes["User"],
	deleteUser: ModelTypes["User"],
	updateMyPreferences: ModelTypes["UserPreferences"]
};
	["IDFilter"]: {
	equals?: string | undefined,
	in?: Array<string> | undefined,
	notIn?: Array<string> | undefined,
	lt?: string | undefined,
	lte?: string | undefined,
	gt?: string | undefined,
	gte?: string | undefined,
	not?: ModelTypes["IDFilter"] | undefined
};
	["RelationshipNullableFilter"]: {
	id?: string | undefined,
	is?: ModelTypes["Null"] | undefined,
	isNot?: ModelTypes["Null"] | undefined
};
	["ArrayNullableFilter"]: {
	equals?: Array<string> | undefined,
	hasSome?: Array<string> | undefined,
	hasEvery?: Array<string> | undefined,
	has?: string | undefined,
	isEmpty?: boolean | undefined
};
	["StringNullableFilter"]: {
	equals?: string | undefined,
	in?: Array<string> | undefined,
	notIn?: Array<string> | undefined,
	lt?: string | undefined,
	lte?: string | undefined,
	gt?: string | undefined,
	gte?: string | undefined,
	contains?: string | undefined,
	startsWith?: string | undefined,
	endsWith?: string | undefined,
	mode?: ModelTypes["QueryMode"] | undefined,
	not?: ModelTypes["NestedStringNullableFilter"] | undefined
};
	["NestedStringNullableFilter"]: {
	equals?: string | undefined,
	in?: Array<string> | undefined,
	notIn?: Array<string> | undefined,
	lt?: string | undefined,
	lte?: string | undefined,
	gt?: string | undefined,
	gte?: string | undefined,
	contains?: string | undefined,
	startsWith?: string | undefined,
	endsWith?: string | undefined,
	not?: ModelTypes["NestedStringNullableFilter"] | undefined
};
	["IntNullableFilter"]: {
	equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: ModelTypes["NestedIntNullableFilter"] | undefined
};
	["NestedIntNullableFilter"]: {
	equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: ModelTypes["NestedIntNullableFilter"] | undefined
};
	["FloatNullableFilter"]: {
	equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: ModelTypes["NestedFloatNullableFilter"] | undefined
};
	["NestedFloatNullableFilter"]: {
	equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: ModelTypes["NestedFloatNullableFilter"] | undefined
};
	["QueryMode"]:QueryMode;
	["OrderDirection"]:OrderDirection;
	["BatchPayload"]: {
		count: number
};
	["Gender"]:Gender;
	["MessageResponse"]: {
		message: string
};
	["FrequentlyAskedQuestion"]: {
		id: string,
	question: string,
	questionEn: string,
	questionAr?: string | undefined,
	answer: string,
	answerEn: string,
	answerAr?: string | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["FrequentlyAskedQuestionWhereUniqueInput"]: {
	id?: string | undefined
};
	["FrequentlyAskedQuestionWhereInput"]: {
	AND?: Array<ModelTypes["FrequentlyAskedQuestionWhereInput"]> | undefined,
	OR?: Array<ModelTypes["FrequentlyAskedQuestionWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["FrequentlyAskedQuestionWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["FrequentlyAskedQuestionCreateInput"]: {
	questionEn: string,
	questionAr?: string | undefined,
	answerEn: string,
	answerAr?: string | undefined
};
	["FrequentlyAskedQuestionUpdateInput"]: {
	questionEn?: string | undefined,
	questionAr?: string | undefined,
	answerEn?: string | undefined,
	answerAr?: string | undefined
};
	["FrequentlyAskedQuestionOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["InterpreterRatingOption"]: {
		id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	ratingVisibleFrom?: number | undefined,
	ratingVisibleTo?: number | undefined,
	ratings: Array<ModelTypes["InterpreterRating"]>,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["InterpreterRatingOptionWhereUniqueInput"]: {
	id?: string | undefined
};
	["InterpreterRatingOptionWhereInput"]: {
	AND?: Array<ModelTypes["InterpreterRatingOptionWhereInput"]> | undefined,
	OR?: Array<ModelTypes["InterpreterRatingOptionWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["InterpreterRatingOptionWhereInput"]> | undefined,
	ratingVisibleFrom?: ModelTypes["FloatNullableFilter"] | undefined,
	ratingVisibleTo?: ModelTypes["FloatNullableFilter"] | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["InterpreterRatingOptionCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined,
	ratingVisibleFrom: number,
	ratingVisibleTo: number
};
	["InterpreterRatingOptionUpdateInput"]: {
	titleEn?: string | undefined,
	titleAr?: string | undefined,
	ratingVisibleFrom?: number | undefined,
	ratingVisibleTo?: number | undefined
};
	["InterpreterRatingOptionOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["InterpreterRating"]: {
		id: string,
	rating: number,
	options: ModelTypes["InterpreterRatingOption"],
	tellUsMore?: string | undefined,
	ip?: string | undefined,
	interpreter: ModelTypes["Interpreter"],
	user?: ModelTypes["User"] | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["InterpreterRatingWhereUniqueInput"]: {
	id?: string | undefined
};
	["InterpreterRatingWhereInput"]: {
	AND?: Array<ModelTypes["InterpreterRatingWhereInput"]> | undefined,
	OR?: Array<ModelTypes["InterpreterRatingWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["InterpreterRatingWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["InterpreterRatingCreateInput"]: {
	interpreter: string,
	rating: number,
	tellUsMore?: string | undefined,
	options: Array<string>
};
	["InterpreterRatingUpdateInput"]: {
	interpreter?: string | undefined,
	rating?: number | undefined,
	tellUsMore?: string | undefined,
	options?: Array<string> | undefined
};
	["InterpreterRatingOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["InterpreterStatus"]:InterpreterStatus;
	["InterpreterUser"]: {
		id: string,
	firstName: string,
	lastName: string,
	fullName?: string | undefined,
	image?: string | undefined
};
	["Interpreter"]: {
		id: string,
	languages: Array<string>,
	ratings: Array<ModelTypes["InterpreterRating"]>,
	rating: number,
	user: ModelTypes["InterpreterUser"],
	online: boolean,
	approved: boolean,
	status: ModelTypes["InterpreterStatus"],
	isBusy: boolean,
	isFavorite: boolean,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["InterpreterWhereUniqueInput"]: {
	id?: string | undefined
};
	["InterpreterWhereInput"]: {
	AND?: Array<ModelTypes["InterpreterWhereInput"]> | undefined,
	OR?: Array<ModelTypes["InterpreterWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["InterpreterWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["InterpreterUpdateInput"]: {
	languages?: Array<string> | undefined,
	status?: ModelTypes["InterpreterStatus"] | undefined
};
	["MyInterpreterUpdateInput"]: {
	languages?: Array<string> | undefined
};
	["InterpreterOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	approved?: ModelTypes["OrderDirection"] | undefined,
	online?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["SubmitExpoTokenInput"]: {
	token: string
};
	["CompareVersionsInput"]: {
	version: string
};
	["SendNotificationInput"]: {
	title: string,
	body: string,
	test?: boolean | undefined
};
	["Notification"]: {
		id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	message: string,
	messageEn: string,
	messageAr?: string | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["NotificationWhereUniqueInput"]: {
	id?: string | undefined
};
	["NotificationWhereInput"]: {
	AND?: Array<ModelTypes["NotificationWhereInput"]> | undefined,
	OR?: Array<ModelTypes["NotificationWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["NotificationWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["NotificationCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined,
	messageEn: string,
	messageAr?: string | undefined
};
	["NotificationUpdateInput"]: {
	titleEn?: string | undefined,
	titleAr?: string | undefined,
	messageEn?: string | undefined,
	messageAr?: string | undefined
};
	["NotificationOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["PrivacyPolicyAcceptance"]: {
		id: string,
	privacyPolicy: ModelTypes["PrivacyPolicy"],
	user: ModelTypes["User"],
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["PrivacyPolicy"]: {
		id: string,
	content: string,
	contentEn: string,
	contentAr?: string | undefined,
	version: number,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["PrivacyPolicyWhereUniqueInput"]: {
	id?: string | undefined
};
	["PrivacyPolicyWhereInput"]: {
	AND?: Array<ModelTypes["PrivacyPolicyWhereInput"]> | undefined,
	OR?: Array<ModelTypes["PrivacyPolicyWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["PrivacyPolicyWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["PrivacyPolicyCreateInput"]: {
	contentEn: string,
	contentAr?: string | undefined
};
	["PrivacyPolicyUpdateInput"]: {
	contentEn?: string | undefined,
	contentAr?: string | undefined
};
	["PrivacyPolicyOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["Upload"]:any;
	["Date"]:any;
	["Null"]:any;
	["NullableString"]:any;
	["NullableNumber"]:any;
	["NullableID"]:any;
	["UntrimmedString"]:any;
	["LowercaseString"]:any;
	["UppercaseString"]:any;
	["EmailAddress"]:any;
	["Password"]:any;
	["OTP"]:any;
	["PhoneNumber"]:any;
	["ServiceCategory"]: {
		id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	image: string,
	services?: Array<ModelTypes["Service"]> | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["ServiceCategoryWhereUniqueInput"]: {
	id?: string | undefined
};
	["ServiceCategoryWhereInput"]: {
	AND?: Array<ModelTypes["ServiceCategoryWhereInput"]> | undefined,
	OR?: Array<ModelTypes["ServiceCategoryWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["ServiceCategoryWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["ServiceCategoryCreateInput"]: {
	titleEn: string,
	titleAr?: string | undefined,
	image: ModelTypes["Upload"]
};
	["ServiceCategoryUpdateInput"]: {
	titleEn?: string | undefined,
	titleAr?: string | undefined,
	image?: ModelTypes["Upload"] | undefined
};
	["ServiceCategoryOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	titleEn?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["Service"]: {
		id: string,
	name: string,
	nameEn: string,
	nameAr?: string | undefined,
	description: string,
	descriptionEn: string,
	descriptionAr?: string | undefined,
	phone: string,
	image: string,
	category?: ModelTypes["ServiceCategory"] | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["ServiceWhereUniqueInput"]: {
	id?: string | undefined
};
	["ServiceWhereInput"]: {
	AND?: Array<ModelTypes["ServiceWhereInput"]> | undefined,
	OR?: Array<ModelTypes["ServiceWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["ServiceWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["ServiceCreateInput"]: {
	nameEn: string,
	nameAr?: string | undefined,
	descriptionEn: string,
	descriptionAr?: string | undefined,
	phone: ModelTypes["PhoneNumber"],
	image: ModelTypes["Upload"],
	categoryId: string
};
	["ServiceUpdateInput"]: {
	nameEn?: string | undefined,
	nameAr?: string | undefined,
	descriptionEn?: string | undefined,
	descriptionAr?: string | undefined,
	phone?: ModelTypes["PhoneNumber"] | undefined,
	image?: ModelTypes["Upload"] | undefined,
	categoryId?: string | undefined
};
	["ServiceOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["TermsOfUseAcceptance"]: {
		id: string,
	termsOfUse: ModelTypes["TermsOfUse"],
	user: ModelTypes["User"],
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["TermsOfUse"]: {
		id: string,
	content: string,
	contentEn: string,
	contentAr?: string | undefined,
	version: number,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["TermsOfUseWhereUniqueInput"]: {
	id?: string | undefined
};
	["TermsOfUseWhereInput"]: {
	AND?: Array<ModelTypes["TermsOfUseWhereInput"]> | undefined,
	OR?: Array<ModelTypes["TermsOfUseWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["TermsOfUseWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined
};
	["TermsOfUseCreateInput"]: {
	contentEn: string,
	contentAr: string
};
	["TermsOfUseUpdateInput"]: {
	contentEn?: string | undefined,
	contentAr?: string | undefined
};
	["TermsOfUseOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["UserPreferences"]: {
		id: string,
	emailNotifications: boolean,
	smsNotifications: boolean,
	pushNotifications: boolean
};
	["UserRole"]:UserRole;
	["User"]: {
		id: string,
	firstName: string,
	lastName: string,
	fullName: string,
	cpr: string,
	email: string,
	dateOfBirth: ModelTypes["Date"],
	language: string,
	country: string,
	city: string,
	mobile: string,
	gender: ModelTypes["Gender"],
	role: ModelTypes["UserRole"],
	image?: string | undefined,
	preferences?: ModelTypes["UserPreferences"] | undefined,
	createdAt: ModelTypes["Date"],
	updatedAt: ModelTypes["Date"]
};
	["UserWhereUniqueInput"]: {
	id?: string | undefined,
	email?: ModelTypes["EmailAddress"] | undefined
};
	["UserRoleNullableFilter"]: {
	equals?: ModelTypes["UserRole"] | undefined,
	in?: Array<ModelTypes["UserRole"]> | undefined,
	notIn?: Array<ModelTypes["UserRole"]> | undefined
};
	["UserWhereInput"]: {
	AND?: Array<ModelTypes["UserWhereInput"]> | undefined,
	OR?: Array<ModelTypes["UserWhereInput"]> | undefined,
	NOT?: Array<ModelTypes["UserWhereInput"]> | undefined,
	id?: ModelTypes["IDFilter"] | undefined,
	firstName?: ModelTypes["StringNullableFilter"] | undefined,
	lastName?: ModelTypes["StringNullableFilter"] | undefined,
	email?: ModelTypes["StringNullableFilter"] | undefined,
	role?: ModelTypes["UserRoleNullableFilter"] | undefined
};
	["UserCreateInput"]: {
	firstName: string,
	lastName: string,
	cpr: string,
	email: ModelTypes["EmailAddress"],
	dateOfBirth: ModelTypes["Date"],
	language: ModelTypes["UppercaseString"],
	country: string,
	city: string,
	mobile: ModelTypes["PhoneNumber"],
	gender: ModelTypes["Gender"],
	password: ModelTypes["Password"],
	role?: ModelTypes["UserRole"] | undefined,
	image?: ModelTypes["Upload"] | undefined
};
	["UserUpdateInput"]: {
	firstName?: string | undefined,
	lastName?: string | undefined,
	cpr?: string | undefined,
	email?: ModelTypes["EmailAddress"] | undefined,
	dateOfBirth?: ModelTypes["Date"] | undefined,
	language?: ModelTypes["UppercaseString"] | undefined,
	country?: string | undefined,
	city?: string | undefined,
	mobile?: ModelTypes["PhoneNumber"] | undefined,
	gender?: ModelTypes["Gender"] | undefined,
	password?: ModelTypes["Password"] | undefined,
	role?: ModelTypes["UserRole"] | undefined,
	image?: ModelTypes["Upload"] | undefined
};
	["MyUserUpdateInput"]: {
	firstName?: string | undefined,
	lastName?: string | undefined,
	cpr?: string | undefined,
	email?: ModelTypes["EmailAddress"] | undefined,
	dateOfBirth?: ModelTypes["Date"] | undefined,
	language?: ModelTypes["UppercaseString"] | undefined,
	country?: string | undefined,
	city?: string | undefined,
	mobile?: ModelTypes["PhoneNumber"] | undefined,
	gender?: ModelTypes["Gender"] | undefined,
	image?: ModelTypes["Upload"] | undefined
};
	["MyUserPreferencesUpdateInput"]: {
	emailNotifications?: boolean | undefined,
	smsNotifications?: boolean | undefined,
	pushNotifications?: boolean | undefined
};
	["MyUserDeleteInput"]: {
	password: string
};
	["UserOrderByInput"]: {
	id?: ModelTypes["OrderDirection"] | undefined,
	firstName?: ModelTypes["OrderDirection"] | undefined,
	lastName?: ModelTypes["OrderDirection"] | undefined,
	email?: ModelTypes["OrderDirection"] | undefined,
	role?: ModelTypes["OrderDirection"] | undefined,
	createdAt?: ModelTypes["OrderDirection"] | undefined
};
	["UserFilter"]: {
	firstName?: string | undefined,
	lastName?: string | undefined,
	email?: ModelTypes["EmailAddress"] | undefined,
	role?: ModelTypes["UserRole"] | undefined
}
    }

export type GraphQLTypes = {
    ["About"]: {
	__typename: "About",
	id: string,
	content?: string | undefined,
	contentEn: string,
	contentAr?: string | undefined,
	version: number,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["AboutWhereUniqueInput"]: {
		id?: string | undefined
};
	["AboutWhereInput"]: {
		AND?: Array<GraphQLTypes["AboutWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["AboutWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["AboutWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["AboutCreateInput"]: {
		contentEn: string,
	contentAr?: string | undefined
};
	["AboutUpdateInput"]: {
		contentEn?: string | undefined,
	contentAr?: string | undefined
};
	["AboutOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["Advertisement"]: {
	__typename: "Advertisement",
	id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	content: string,
	contentEn: string,
	contentAr?: string | undefined,
	image: string,
	url?: string | undefined,
	duration: number,
	active: boolean,
	views: number,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["AdvertisementWhereUniqueInput"]: {
		id?: string | undefined
};
	["AdvertisementWhereInput"]: {
		AND?: Array<GraphQLTypes["AdvertisementWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["AdvertisementWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["AdvertisementWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["AdvertisementCreateInput"]: {
		titleEn: string,
	titleAr?: string | undefined,
	contentEn: string,
	contentAr?: string | undefined,
	image: GraphQLTypes["Upload"],
	url: string,
	duration: number,
	active: boolean
};
	["AdvertisementUpdateInput"]: {
		titleEn?: string | undefined,
	titleAr?: string | undefined,
	contentEn?: string | undefined,
	contentAr?: string | undefined,
	image?: GraphQLTypes["Upload"] | undefined,
	url?: string | undefined,
	duration?: number | undefined,
	active?: boolean | undefined
};
	["AdvertisementOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	views?: GraphQLTypes["OrderDirection"] | undefined,
	active?: GraphQLTypes["OrderDirection"] | undefined,
	duration?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["AuthenticationResponse"]: {
	__typename: "AuthenticationResponse",
	authentication?: GraphQLTypes["Authentication"] | undefined,
	message?: string | undefined
};
	["Authentication"]: {
	__typename: "Authentication",
	user: GraphQLTypes["User"],
	token: string
};
	["LoginInput"]: {
		email: GraphQLTypes["EmailAddress"],
	password: string
};
	["CheckEmailInput"]: {
		email: GraphQLTypes["EmailAddress"]
};
	["RegistrationInterpreterInput"]: {
		languages: Array<string>
};
	["VerifyRegistrationInput"]: {
		email: GraphQLTypes["EmailAddress"],
	code: GraphQLTypes["OTP"]
};
	["RegistrationInput"]: {
		firstName: string,
	lastName: string,
	cpr: string,
	email: GraphQLTypes["EmailAddress"],
	dateOfBirth: GraphQLTypes["Date"],
	language: string,
	country: string,
	city: string,
	mobile: GraphQLTypes["PhoneNumber"],
	gender: GraphQLTypes["Gender"],
	password: GraphQLTypes["Password"],
	interpreter?: GraphQLTypes["RegistrationInterpreterInput"] | undefined,
	acceptPrivacyPolicy: boolean,
	acceptTermsOfUse: boolean
};
	["RequestPasswordResetInput"]: {
		email: GraphQLTypes["EmailAddress"]
};
	["VerifyPasswordResetInput"]: {
		email: GraphQLTypes["EmailAddress"],
	code: GraphQLTypes["OTP"]
};
	["ResetPasswordInput"]: {
		code: GraphQLTypes["OTP"],
	email: GraphQLTypes["EmailAddress"],
	password: GraphQLTypes["Password"]
};
	["ChangePasswordInput"]: {
		currentPassword: string,
	newPassword: GraphQLTypes["Password"]
};
	["CallStatus"]: CallStatus;
	["Call"]: {
	__typename: "Call",
	id: string,
	from: GraphQLTypes["User"],
	to: GraphQLTypes["Interpreter"],
	token?: string | undefined,
	status: GraphQLTypes["CallStatus"],
	service?: GraphQLTypes["Service"] | undefined,
	startedAt?: GraphQLTypes["Date"] | undefined,
	endedAt?: GraphQLTypes["Date"] | undefined,
	serviceCalledAt?: GraphQLTypes["Date"] | undefined,
	serviceEndedAt?: GraphQLTypes["Date"] | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["CallWhereUniqueInput"]: {
		id?: string | undefined
};
	["CallWhereInput"]: {
		AND?: Array<GraphQLTypes["CallWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["CallWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["CallWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["StartCallWhereInput"]: {
		id: string
};
	["KeepCallAliveWhereInput"]: {
		id: string
};
	["KeepCallAliveData"]: {
		getToken?: boolean | undefined
};
	["EndCallInput"]: {
		id: string
};
	["CallOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["ConnectServiceInput"]: {
		id: string
};
	["Query"]: {
	__typename: "Query",
	_empty?: string | undefined,
	latestAbout: GraphQLTypes["About"],
	about: GraphQLTypes["About"],
	abouts: Array<GraphQLTypes["About"]>,
	aboutsCount: number,
	advertisement?: GraphQLTypes["Advertisement"] | undefined,
	advertisements: Array<GraphQLTypes["Advertisement"]>,
	advertisementsCount: number,
	activeAdvertisements: Array<GraphQLTypes["Advertisement"]>,
	login: GraphQLTypes["AuthenticationResponse"],
	call: GraphQLTypes["Call"],
	calls: Array<GraphQLTypes["Call"]>,
	callsCount: number,
	outboundNumber: string,
	frequentlyAskedQuestion: GraphQLTypes["FrequentlyAskedQuestion"],
	frequentlyAskedQuestions: Array<GraphQLTypes["FrequentlyAskedQuestion"]>,
	frequentlyAskedQuestionsCount: number,
	interpreterRatingOption: GraphQLTypes["InterpreterRatingOption"],
	interpreterRatingOptions: Array<GraphQLTypes["InterpreterRatingOption"]>,
	interpreterRatingOptionsCount: number,
	interpreterRating: GraphQLTypes["InterpreterRating"],
	interpreterRatings: Array<GraphQLTypes["InterpreterRating"]>,
	interpreterRatingsCount: number,
	interpreter: GraphQLTypes["Interpreter"],
	interpreters: Array<GraphQLTypes["Interpreter"]>,
	interpretersCount: number,
	myAvailability: boolean,
	maintenanceMode: GraphQLTypes["MessageResponse"],
	compareVersions: GraphQLTypes["MessageResponse"],
	notification: GraphQLTypes["Notification"],
	notifications: Array<GraphQLTypes["Notification"]>,
	myNotifications: Array<GraphQLTypes["Notification"]>,
	notificationsCount: number,
	myNotificationsCount: number,
	latestPrivacyPolicy: GraphQLTypes["PrivacyPolicy"],
	privacyPolicy: GraphQLTypes["PrivacyPolicy"],
	privacyPolicies: Array<GraphQLTypes["PrivacyPolicy"]>,
	privacyPoliciesCount: number,
	serviceCategory: GraphQLTypes["ServiceCategory"],
	serviceCategories: Array<GraphQLTypes["ServiceCategory"]>,
	serviceCategoriesCount: number,
	service: GraphQLTypes["Service"],
	services: Array<GraphQLTypes["Service"]>,
	servicesCount: number,
	latestTermsOfUse: GraphQLTypes["TermsOfUse"],
	termsOfUse: GraphQLTypes["TermsOfUse"],
	termsOfUses: Array<GraphQLTypes["TermsOfUse"]>,
	termsOfUsesCount: number,
	myUser: GraphQLTypes["User"],
	user: GraphQLTypes["User"],
	users: Array<GraphQLTypes["User"]>,
	usersCount: number,
	myPreferences: GraphQLTypes["UserPreferences"]
};
	["Mutation"]: {
	__typename: "Mutation",
	_empty?: string | undefined,
	createAbout: GraphQLTypes["About"],
	updateAbout: GraphQLTypes["About"],
	deleteAbout: GraphQLTypes["About"],
	createAdvertisement: GraphQLTypes["Advertisement"],
	updateAdvertisement: GraphQLTypes["Advertisement"],
	deleteAdvertisement: GraphQLTypes["Advertisement"],
	activateAdvertisement: GraphQLTypes["Advertisement"],
	register: GraphQLTypes["MessageResponse"],
	verifyRegistration: GraphQLTypes["AuthenticationResponse"],
	requestPasswordReset: GraphQLTypes["MessageResponse"],
	verifyPasswordReset: GraphQLTypes["MessageResponse"],
	resetPassword: GraphQLTypes["AuthenticationResponse"],
	changePassword: GraphQLTypes["MessageResponse"],
	activeCall?: GraphQLTypes["Call"] | undefined,
	startCall: GraphQLTypes["Call"],
	endCall: GraphQLTypes["Call"],
	keepCallAlive: GraphQLTypes["Call"],
	answerCall: GraphQLTypes["Call"],
	rejectCall: GraphQLTypes["Call"],
	connectService: GraphQLTypes["Call"],
	disconnectService: GraphQLTypes["Call"],
	createFrequentlyAskedQuestion: GraphQLTypes["FrequentlyAskedQuestion"],
	updateFrequentlyAskedQuestion: GraphQLTypes["FrequentlyAskedQuestion"],
	deleteFrequentlyAskedQuestion: GraphQLTypes["FrequentlyAskedQuestion"],
	createInterpreterRatingOption: GraphQLTypes["InterpreterRatingOption"],
	updateInterpreterRatingOption: GraphQLTypes["InterpreterRatingOption"],
	deleteInterpreterRatingOption: GraphQLTypes["InterpreterRatingOption"],
	createInterpreterRating: GraphQLTypes["InterpreterRating"],
	updateInterpreterRating: GraphQLTypes["InterpreterRating"],
	deleteInterpreterRating: GraphQLTypes["InterpreterRating"],
	approveInterpreter: GraphQLTypes["Interpreter"],
	rejectInterpreter: GraphQLTypes["Interpreter"],
	updateInterpreter: GraphQLTypes["Interpreter"],
	updateMyInterpreter: GraphQLTypes["Interpreter"],
	toggleInterpreterAvailability: boolean,
	toggleFavoriteInterpreter: boolean,
	toggleMaintenanceMode: GraphQLTypes["MessageResponse"],
	submitExpoToken: GraphQLTypes["MessageResponse"],
	sendNotification: GraphQLTypes["MessageResponse"],
	createNotification: GraphQLTypes["Notification"],
	updateNotification: GraphQLTypes["Notification"],
	deleteNotification: GraphQLTypes["Notification"],
	createPrivacyPolicy: GraphQLTypes["PrivacyPolicy"],
	updatePrivacyPolicy: GraphQLTypes["PrivacyPolicy"],
	deletePrivacyPolicy: GraphQLTypes["PrivacyPolicy"],
	acceptPrivacyPolicy: GraphQLTypes["PrivacyPolicyAcceptance"],
	createServiceCategory: GraphQLTypes["ServiceCategory"],
	updateServiceCategory: GraphQLTypes["ServiceCategory"],
	deleteServiceCategory: GraphQLTypes["ServiceCategory"],
	createService: GraphQLTypes["Service"],
	updateService: GraphQLTypes["Service"],
	deleteService: GraphQLTypes["Service"],
	createTermsOfUse: GraphQLTypes["TermsOfUse"],
	updateTermsOfUse: GraphQLTypes["TermsOfUse"],
	deleteTermsOfUse: GraphQLTypes["TermsOfUse"],
	acceptTermsOfUse: GraphQLTypes["TermsOfUseAcceptance"],
	createUser: GraphQLTypes["User"],
	updateMyUser: GraphQLTypes["User"],
	updateUser: GraphQLTypes["User"],
	deleteMyUser: GraphQLTypes["User"],
	deleteUser: GraphQLTypes["User"],
	updateMyPreferences: GraphQLTypes["UserPreferences"]
};
	["IDFilter"]: {
		equals?: string | undefined,
	in?: Array<string> | undefined,
	notIn?: Array<string> | undefined,
	lt?: string | undefined,
	lte?: string | undefined,
	gt?: string | undefined,
	gte?: string | undefined,
	not?: GraphQLTypes["IDFilter"] | undefined
};
	["RelationshipNullableFilter"]: {
		id?: string | undefined,
	is?: GraphQLTypes["Null"] | undefined,
	isNot?: GraphQLTypes["Null"] | undefined
};
	["ArrayNullableFilter"]: {
		equals?: Array<string> | undefined,
	hasSome?: Array<string> | undefined,
	hasEvery?: Array<string> | undefined,
	has?: string | undefined,
	isEmpty?: boolean | undefined
};
	["StringNullableFilter"]: {
		equals?: string | undefined,
	in?: Array<string> | undefined,
	notIn?: Array<string> | undefined,
	lt?: string | undefined,
	lte?: string | undefined,
	gt?: string | undefined,
	gte?: string | undefined,
	contains?: string | undefined,
	startsWith?: string | undefined,
	endsWith?: string | undefined,
	mode?: GraphQLTypes["QueryMode"] | undefined,
	not?: GraphQLTypes["NestedStringNullableFilter"] | undefined
};
	["NestedStringNullableFilter"]: {
		equals?: string | undefined,
	in?: Array<string> | undefined,
	notIn?: Array<string> | undefined,
	lt?: string | undefined,
	lte?: string | undefined,
	gt?: string | undefined,
	gte?: string | undefined,
	contains?: string | undefined,
	startsWith?: string | undefined,
	endsWith?: string | undefined,
	not?: GraphQLTypes["NestedStringNullableFilter"] | undefined
};
	["IntNullableFilter"]: {
		equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: GraphQLTypes["NestedIntNullableFilter"] | undefined
};
	["NestedIntNullableFilter"]: {
		equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: GraphQLTypes["NestedIntNullableFilter"] | undefined
};
	["FloatNullableFilter"]: {
		equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: GraphQLTypes["NestedFloatNullableFilter"] | undefined
};
	["NestedFloatNullableFilter"]: {
		equals?: number | undefined,
	in?: Array<number> | undefined,
	notIn?: Array<number> | undefined,
	lt?: number | undefined,
	lte?: number | undefined,
	gt?: number | undefined,
	gte?: number | undefined,
	not?: GraphQLTypes["NestedFloatNullableFilter"] | undefined
};
	["QueryMode"]: QueryMode;
	["OrderDirection"]: OrderDirection;
	["BatchPayload"]: {
	__typename: "BatchPayload",
	count: number
};
	["Gender"]: Gender;
	["MessageResponse"]: {
	__typename: "MessageResponse",
	message: string
};
	["FrequentlyAskedQuestion"]: {
	__typename: "FrequentlyAskedQuestion",
	id: string,
	question: string,
	questionEn: string,
	questionAr?: string | undefined,
	answer: string,
	answerEn: string,
	answerAr?: string | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["FrequentlyAskedQuestionWhereUniqueInput"]: {
		id?: string | undefined
};
	["FrequentlyAskedQuestionWhereInput"]: {
		AND?: Array<GraphQLTypes["FrequentlyAskedQuestionWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["FrequentlyAskedQuestionWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["FrequentlyAskedQuestionWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["FrequentlyAskedQuestionCreateInput"]: {
		questionEn: string,
	questionAr?: string | undefined,
	answerEn: string,
	answerAr?: string | undefined
};
	["FrequentlyAskedQuestionUpdateInput"]: {
		questionEn?: string | undefined,
	questionAr?: string | undefined,
	answerEn?: string | undefined,
	answerAr?: string | undefined
};
	["FrequentlyAskedQuestionOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["InterpreterRatingOption"]: {
	__typename: "InterpreterRatingOption",
	id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	ratingVisibleFrom?: number | undefined,
	ratingVisibleTo?: number | undefined,
	ratings: Array<GraphQLTypes["InterpreterRating"]>,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["InterpreterRatingOptionWhereUniqueInput"]: {
		id?: string | undefined
};
	["InterpreterRatingOptionWhereInput"]: {
		AND?: Array<GraphQLTypes["InterpreterRatingOptionWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["InterpreterRatingOptionWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["InterpreterRatingOptionWhereInput"]> | undefined,
	ratingVisibleFrom?: GraphQLTypes["FloatNullableFilter"] | undefined,
	ratingVisibleTo?: GraphQLTypes["FloatNullableFilter"] | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["InterpreterRatingOptionCreateInput"]: {
		titleEn: string,
	titleAr?: string | undefined,
	ratingVisibleFrom: number,
	ratingVisibleTo: number
};
	["InterpreterRatingOptionUpdateInput"]: {
		titleEn?: string | undefined,
	titleAr?: string | undefined,
	ratingVisibleFrom?: number | undefined,
	ratingVisibleTo?: number | undefined
};
	["InterpreterRatingOptionOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["InterpreterRating"]: {
	__typename: "InterpreterRating",
	id: string,
	rating: number,
	options: GraphQLTypes["InterpreterRatingOption"],
	tellUsMore?: string | undefined,
	ip?: string | undefined,
	interpreter: GraphQLTypes["Interpreter"],
	user?: GraphQLTypes["User"] | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["InterpreterRatingWhereUniqueInput"]: {
		id?: string | undefined
};
	["InterpreterRatingWhereInput"]: {
		AND?: Array<GraphQLTypes["InterpreterRatingWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["InterpreterRatingWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["InterpreterRatingWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["InterpreterRatingCreateInput"]: {
		interpreter: string,
	rating: number,
	tellUsMore?: string | undefined,
	options: Array<string>
};
	["InterpreterRatingUpdateInput"]: {
		interpreter?: string | undefined,
	rating?: number | undefined,
	tellUsMore?: string | undefined,
	options?: Array<string> | undefined
};
	["InterpreterRatingOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["InterpreterStatus"]: InterpreterStatus;
	["InterpreterUser"]: {
	__typename: "InterpreterUser",
	id: string,
	firstName: string,
	lastName: string,
	fullName?: string | undefined,
	image?: string | undefined
};
	["Interpreter"]: {
	__typename: "Interpreter",
	id: string,
	languages: Array<string>,
	ratings: Array<GraphQLTypes["InterpreterRating"]>,
	rating: number,
	user: GraphQLTypes["InterpreterUser"],
	online: boolean,
	approved: boolean,
	status: GraphQLTypes["InterpreterStatus"],
	isBusy: boolean,
	isFavorite: boolean,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["InterpreterWhereUniqueInput"]: {
		id?: string | undefined
};
	["InterpreterWhereInput"]: {
		AND?: Array<GraphQLTypes["InterpreterWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["InterpreterWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["InterpreterWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["InterpreterUpdateInput"]: {
		languages?: Array<string> | undefined,
	status?: GraphQLTypes["InterpreterStatus"] | undefined
};
	["MyInterpreterUpdateInput"]: {
		languages?: Array<string> | undefined
};
	["InterpreterOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	approved?: GraphQLTypes["OrderDirection"] | undefined,
	online?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["SubmitExpoTokenInput"]: {
		token: string
};
	["CompareVersionsInput"]: {
		version: string
};
	["SendNotificationInput"]: {
		title: string,
	body: string,
	test?: boolean | undefined
};
	["Notification"]: {
	__typename: "Notification",
	id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	message: string,
	messageEn: string,
	messageAr?: string | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["NotificationWhereUniqueInput"]: {
		id?: string | undefined
};
	["NotificationWhereInput"]: {
		AND?: Array<GraphQLTypes["NotificationWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["NotificationWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["NotificationWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["NotificationCreateInput"]: {
		titleEn: string,
	titleAr?: string | undefined,
	messageEn: string,
	messageAr?: string | undefined
};
	["NotificationUpdateInput"]: {
		titleEn?: string | undefined,
	titleAr?: string | undefined,
	messageEn?: string | undefined,
	messageAr?: string | undefined
};
	["NotificationOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["PrivacyPolicyAcceptance"]: {
	__typename: "PrivacyPolicyAcceptance",
	id: string,
	privacyPolicy: GraphQLTypes["PrivacyPolicy"],
	user: GraphQLTypes["User"],
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["PrivacyPolicy"]: {
	__typename: "PrivacyPolicy",
	id: string,
	content: string,
	contentEn: string,
	contentAr?: string | undefined,
	version: number,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["PrivacyPolicyWhereUniqueInput"]: {
		id?: string | undefined
};
	["PrivacyPolicyWhereInput"]: {
		AND?: Array<GraphQLTypes["PrivacyPolicyWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["PrivacyPolicyWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["PrivacyPolicyWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["PrivacyPolicyCreateInput"]: {
		contentEn: string,
	contentAr?: string | undefined
};
	["PrivacyPolicyUpdateInput"]: {
		contentEn?: string | undefined,
	contentAr?: string | undefined
};
	["PrivacyPolicyOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["Upload"]: any;
	["Date"]: Date;
	["Null"]: null | undefined;
	["NullableString"]: null | string;
	["NullableNumber"]: null | number;
	["NullableID"]: null | string;
	["UntrimmedString"]: string;
	["LowercaseString"]: string;
	["UppercaseString"]: string;
	["EmailAddress"]: string;
	["Password"]: string;
	["OTP"]: string;
	["PhoneNumber"]: string;
	["ServiceCategory"]: {
	__typename: "ServiceCategory",
	id: string,
	title: string,
	titleEn: string,
	titleAr?: string | undefined,
	image: string,
	services?: Array<GraphQLTypes["Service"]> | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["ServiceCategoryWhereUniqueInput"]: {
		id?: string | undefined
};
	["ServiceCategoryWhereInput"]: {
		AND?: Array<GraphQLTypes["ServiceCategoryWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["ServiceCategoryWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["ServiceCategoryWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["ServiceCategoryCreateInput"]: {
		titleEn: string,
	titleAr?: string | undefined,
	image: GraphQLTypes["Upload"]
};
	["ServiceCategoryUpdateInput"]: {
		titleEn?: string | undefined,
	titleAr?: string | undefined,
	image?: GraphQLTypes["Upload"] | undefined
};
	["ServiceCategoryOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	titleEn?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["Service"]: {
	__typename: "Service",
	id: string,
	name: string,
	nameEn: string,
	nameAr?: string | undefined,
	description: string,
	descriptionEn: string,
	descriptionAr?: string | undefined,
	phone: string,
	image: string,
	category?: GraphQLTypes["ServiceCategory"] | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["ServiceWhereUniqueInput"]: {
		id?: string | undefined
};
	["ServiceWhereInput"]: {
		AND?: Array<GraphQLTypes["ServiceWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["ServiceWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["ServiceWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["ServiceCreateInput"]: {
		nameEn: string,
	nameAr?: string | undefined,
	descriptionEn: string,
	descriptionAr?: string | undefined,
	phone: GraphQLTypes["PhoneNumber"],
	image: GraphQLTypes["Upload"],
	categoryId: string
};
	["ServiceUpdateInput"]: {
		nameEn?: string | undefined,
	nameAr?: string | undefined,
	descriptionEn?: string | undefined,
	descriptionAr?: string | undefined,
	phone?: GraphQLTypes["PhoneNumber"] | undefined,
	image?: GraphQLTypes["Upload"] | undefined,
	categoryId?: string | undefined
};
	["ServiceOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["TermsOfUseAcceptance"]: {
	__typename: "TermsOfUseAcceptance",
	id: string,
	termsOfUse: GraphQLTypes["TermsOfUse"],
	user: GraphQLTypes["User"],
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["TermsOfUse"]: {
	__typename: "TermsOfUse",
	id: string,
	content: string,
	contentEn: string,
	contentAr?: string | undefined,
	version: number,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["TermsOfUseWhereUniqueInput"]: {
		id?: string | undefined
};
	["TermsOfUseWhereInput"]: {
		AND?: Array<GraphQLTypes["TermsOfUseWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["TermsOfUseWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["TermsOfUseWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined
};
	["TermsOfUseCreateInput"]: {
		contentEn: string,
	contentAr: string
};
	["TermsOfUseUpdateInput"]: {
		contentEn?: string | undefined,
	contentAr?: string | undefined
};
	["TermsOfUseOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["UserPreferences"]: {
	__typename: "UserPreferences",
	id: string,
	emailNotifications: boolean,
	smsNotifications: boolean,
	pushNotifications: boolean
};
	["UserRole"]: UserRole;
	["User"]: {
	__typename: "User",
	id: string,
	firstName: string,
	lastName: string,
	fullName: string,
	cpr: string,
	email: string,
	dateOfBirth: GraphQLTypes["Date"],
	language: string,
	country: string,
	city: string,
	mobile: string,
	gender: GraphQLTypes["Gender"],
	role: GraphQLTypes["UserRole"],
	image?: string | undefined,
	preferences?: GraphQLTypes["UserPreferences"] | undefined,
	createdAt: GraphQLTypes["Date"],
	updatedAt: GraphQLTypes["Date"]
};
	["UserWhereUniqueInput"]: {
		id?: string | undefined,
	email?: GraphQLTypes["EmailAddress"] | undefined
};
	["UserRoleNullableFilter"]: {
		equals?: GraphQLTypes["UserRole"] | undefined,
	in?: Array<GraphQLTypes["UserRole"]> | undefined,
	notIn?: Array<GraphQLTypes["UserRole"]> | undefined
};
	["UserWhereInput"]: {
		AND?: Array<GraphQLTypes["UserWhereInput"]> | undefined,
	OR?: Array<GraphQLTypes["UserWhereInput"]> | undefined,
	NOT?: Array<GraphQLTypes["UserWhereInput"]> | undefined,
	id?: GraphQLTypes["IDFilter"] | undefined,
	firstName?: GraphQLTypes["StringNullableFilter"] | undefined,
	lastName?: GraphQLTypes["StringNullableFilter"] | undefined,
	email?: GraphQLTypes["StringNullableFilter"] | undefined,
	role?: GraphQLTypes["UserRoleNullableFilter"] | undefined
};
	["UserCreateInput"]: {
		firstName: string,
	lastName: string,
	cpr: string,
	email: GraphQLTypes["EmailAddress"],
	dateOfBirth: GraphQLTypes["Date"],
	language: GraphQLTypes["UppercaseString"],
	country: string,
	city: string,
	mobile: GraphQLTypes["PhoneNumber"],
	gender: GraphQLTypes["Gender"],
	password: GraphQLTypes["Password"],
	role?: GraphQLTypes["UserRole"] | undefined,
	image?: GraphQLTypes["Upload"] | undefined
};
	["UserUpdateInput"]: {
		firstName?: string | undefined,
	lastName?: string | undefined,
	cpr?: string | undefined,
	email?: GraphQLTypes["EmailAddress"] | undefined,
	dateOfBirth?: GraphQLTypes["Date"] | undefined,
	language?: GraphQLTypes["UppercaseString"] | undefined,
	country?: string | undefined,
	city?: string | undefined,
	mobile?: GraphQLTypes["PhoneNumber"] | undefined,
	gender?: GraphQLTypes["Gender"] | undefined,
	password?: GraphQLTypes["Password"] | undefined,
	role?: GraphQLTypes["UserRole"] | undefined,
	image?: GraphQLTypes["Upload"] | undefined
};
	["MyUserUpdateInput"]: {
		firstName?: string | undefined,
	lastName?: string | undefined,
	cpr?: string | undefined,
	email?: GraphQLTypes["EmailAddress"] | undefined,
	dateOfBirth?: GraphQLTypes["Date"] | undefined,
	language?: GraphQLTypes["UppercaseString"] | undefined,
	country?: string | undefined,
	city?: string | undefined,
	mobile?: GraphQLTypes["PhoneNumber"] | undefined,
	gender?: GraphQLTypes["Gender"] | undefined,
	image?: GraphQLTypes["Upload"] | undefined
};
	["MyUserPreferencesUpdateInput"]: {
		emailNotifications?: boolean | undefined,
	smsNotifications?: boolean | undefined,
	pushNotifications?: boolean | undefined
};
	["MyUserDeleteInput"]: {
		password: string
};
	["UserOrderByInput"]: {
		id?: GraphQLTypes["OrderDirection"] | undefined,
	firstName?: GraphQLTypes["OrderDirection"] | undefined,
	lastName?: GraphQLTypes["OrderDirection"] | undefined,
	email?: GraphQLTypes["OrderDirection"] | undefined,
	role?: GraphQLTypes["OrderDirection"] | undefined,
	createdAt?: GraphQLTypes["OrderDirection"] | undefined
};
	["UserFilter"]: {
		firstName?: string | undefined,
	lastName?: string | undefined,
	email?: GraphQLTypes["EmailAddress"] | undefined,
	role?: GraphQLTypes["UserRole"] | undefined
}
    }
export type CallStatus = 
	"CALLING"|
	"ANSWERED"|
	"FAILED"|
	"ENDED"|
	"REJECTED"

export type QueryMode = 
	"default"|
	"insensitive"

export type OrderDirection = 
	"asc"|
	"desc"

export type Gender = 
	"MALE"|
	"FEMALE"

export type InterpreterStatus = 
	"APPROVED"|
	"PENDING"|
	"REJECTED"

export type UserRole = 
	"USER"|
	"INTERPRETER"|
	"ADMIN"


type ZEUS_VARIABLES = {
	["AboutWhereUniqueInput"]: ValueTypes["AboutWhereUniqueInput"];
	["AboutWhereInput"]: ValueTypes["AboutWhereInput"];
	["AboutCreateInput"]: ValueTypes["AboutCreateInput"];
	["AboutUpdateInput"]: ValueTypes["AboutUpdateInput"];
	["AboutOrderByInput"]: ValueTypes["AboutOrderByInput"];
	["AdvertisementWhereUniqueInput"]: ValueTypes["AdvertisementWhereUniqueInput"];
	["AdvertisementWhereInput"]: ValueTypes["AdvertisementWhereInput"];
	["AdvertisementCreateInput"]: ValueTypes["AdvertisementCreateInput"];
	["AdvertisementUpdateInput"]: ValueTypes["AdvertisementUpdateInput"];
	["AdvertisementOrderByInput"]: ValueTypes["AdvertisementOrderByInput"];
	["LoginInput"]: ValueTypes["LoginInput"];
	["CheckEmailInput"]: ValueTypes["CheckEmailInput"];
	["RegistrationInterpreterInput"]: ValueTypes["RegistrationInterpreterInput"];
	["VerifyRegistrationInput"]: ValueTypes["VerifyRegistrationInput"];
	["RegistrationInput"]: ValueTypes["RegistrationInput"];
	["RequestPasswordResetInput"]: ValueTypes["RequestPasswordResetInput"];
	["VerifyPasswordResetInput"]: ValueTypes["VerifyPasswordResetInput"];
	["ResetPasswordInput"]: ValueTypes["ResetPasswordInput"];
	["ChangePasswordInput"]: ValueTypes["ChangePasswordInput"];
	["CallStatus"]: ValueTypes["CallStatus"];
	["CallWhereUniqueInput"]: ValueTypes["CallWhereUniqueInput"];
	["CallWhereInput"]: ValueTypes["CallWhereInput"];
	["StartCallWhereInput"]: ValueTypes["StartCallWhereInput"];
	["KeepCallAliveWhereInput"]: ValueTypes["KeepCallAliveWhereInput"];
	["KeepCallAliveData"]: ValueTypes["KeepCallAliveData"];
	["EndCallInput"]: ValueTypes["EndCallInput"];
	["CallOrderByInput"]: ValueTypes["CallOrderByInput"];
	["ConnectServiceInput"]: ValueTypes["ConnectServiceInput"];
	["IDFilter"]: ValueTypes["IDFilter"];
	["RelationshipNullableFilter"]: ValueTypes["RelationshipNullableFilter"];
	["ArrayNullableFilter"]: ValueTypes["ArrayNullableFilter"];
	["StringNullableFilter"]: ValueTypes["StringNullableFilter"];
	["NestedStringNullableFilter"]: ValueTypes["NestedStringNullableFilter"];
	["IntNullableFilter"]: ValueTypes["IntNullableFilter"];
	["NestedIntNullableFilter"]: ValueTypes["NestedIntNullableFilter"];
	["FloatNullableFilter"]: ValueTypes["FloatNullableFilter"];
	["NestedFloatNullableFilter"]: ValueTypes["NestedFloatNullableFilter"];
	["QueryMode"]: ValueTypes["QueryMode"];
	["OrderDirection"]: ValueTypes["OrderDirection"];
	["Gender"]: ValueTypes["Gender"];
	["FrequentlyAskedQuestionWhereUniqueInput"]: ValueTypes["FrequentlyAskedQuestionWhereUniqueInput"];
	["FrequentlyAskedQuestionWhereInput"]: ValueTypes["FrequentlyAskedQuestionWhereInput"];
	["FrequentlyAskedQuestionCreateInput"]: ValueTypes["FrequentlyAskedQuestionCreateInput"];
	["FrequentlyAskedQuestionUpdateInput"]: ValueTypes["FrequentlyAskedQuestionUpdateInput"];
	["FrequentlyAskedQuestionOrderByInput"]: ValueTypes["FrequentlyAskedQuestionOrderByInput"];
	["InterpreterRatingOptionWhereUniqueInput"]: ValueTypes["InterpreterRatingOptionWhereUniqueInput"];
	["InterpreterRatingOptionWhereInput"]: ValueTypes["InterpreterRatingOptionWhereInput"];
	["InterpreterRatingOptionCreateInput"]: ValueTypes["InterpreterRatingOptionCreateInput"];
	["InterpreterRatingOptionUpdateInput"]: ValueTypes["InterpreterRatingOptionUpdateInput"];
	["InterpreterRatingOptionOrderByInput"]: ValueTypes["InterpreterRatingOptionOrderByInput"];
	["InterpreterRatingWhereUniqueInput"]: ValueTypes["InterpreterRatingWhereUniqueInput"];
	["InterpreterRatingWhereInput"]: ValueTypes["InterpreterRatingWhereInput"];
	["InterpreterRatingCreateInput"]: ValueTypes["InterpreterRatingCreateInput"];
	["InterpreterRatingUpdateInput"]: ValueTypes["InterpreterRatingUpdateInput"];
	["InterpreterRatingOrderByInput"]: ValueTypes["InterpreterRatingOrderByInput"];
	["InterpreterStatus"]: ValueTypes["InterpreterStatus"];
	["InterpreterWhereUniqueInput"]: ValueTypes["InterpreterWhereUniqueInput"];
	["InterpreterWhereInput"]: ValueTypes["InterpreterWhereInput"];
	["InterpreterUpdateInput"]: ValueTypes["InterpreterUpdateInput"];
	["MyInterpreterUpdateInput"]: ValueTypes["MyInterpreterUpdateInput"];
	["InterpreterOrderByInput"]: ValueTypes["InterpreterOrderByInput"];
	["SubmitExpoTokenInput"]: ValueTypes["SubmitExpoTokenInput"];
	["CompareVersionsInput"]: ValueTypes["CompareVersionsInput"];
	["SendNotificationInput"]: ValueTypes["SendNotificationInput"];
	["NotificationWhereUniqueInput"]: ValueTypes["NotificationWhereUniqueInput"];
	["NotificationWhereInput"]: ValueTypes["NotificationWhereInput"];
	["NotificationCreateInput"]: ValueTypes["NotificationCreateInput"];
	["NotificationUpdateInput"]: ValueTypes["NotificationUpdateInput"];
	["NotificationOrderByInput"]: ValueTypes["NotificationOrderByInput"];
	["PrivacyPolicyWhereUniqueInput"]: ValueTypes["PrivacyPolicyWhereUniqueInput"];
	["PrivacyPolicyWhereInput"]: ValueTypes["PrivacyPolicyWhereInput"];
	["PrivacyPolicyCreateInput"]: ValueTypes["PrivacyPolicyCreateInput"];
	["PrivacyPolicyUpdateInput"]: ValueTypes["PrivacyPolicyUpdateInput"];
	["PrivacyPolicyOrderByInput"]: ValueTypes["PrivacyPolicyOrderByInput"];
	["Upload"]: ValueTypes["Upload"];
	["Date"]: ValueTypes["Date"];
	["Null"]: ValueTypes["Null"];
	["NullableString"]: ValueTypes["NullableString"];
	["NullableNumber"]: ValueTypes["NullableNumber"];
	["NullableID"]: ValueTypes["NullableID"];
	["UntrimmedString"]: ValueTypes["UntrimmedString"];
	["LowercaseString"]: ValueTypes["LowercaseString"];
	["UppercaseString"]: ValueTypes["UppercaseString"];
	["EmailAddress"]: ValueTypes["EmailAddress"];
	["Password"]: ValueTypes["Password"];
	["OTP"]: ValueTypes["OTP"];
	["PhoneNumber"]: ValueTypes["PhoneNumber"];
	["ServiceCategoryWhereUniqueInput"]: ValueTypes["ServiceCategoryWhereUniqueInput"];
	["ServiceCategoryWhereInput"]: ValueTypes["ServiceCategoryWhereInput"];
	["ServiceCategoryCreateInput"]: ValueTypes["ServiceCategoryCreateInput"];
	["ServiceCategoryUpdateInput"]: ValueTypes["ServiceCategoryUpdateInput"];
	["ServiceCategoryOrderByInput"]: ValueTypes["ServiceCategoryOrderByInput"];
	["ServiceWhereUniqueInput"]: ValueTypes["ServiceWhereUniqueInput"];
	["ServiceWhereInput"]: ValueTypes["ServiceWhereInput"];
	["ServiceCreateInput"]: ValueTypes["ServiceCreateInput"];
	["ServiceUpdateInput"]: ValueTypes["ServiceUpdateInput"];
	["ServiceOrderByInput"]: ValueTypes["ServiceOrderByInput"];
	["TermsOfUseWhereUniqueInput"]: ValueTypes["TermsOfUseWhereUniqueInput"];
	["TermsOfUseWhereInput"]: ValueTypes["TermsOfUseWhereInput"];
	["TermsOfUseCreateInput"]: ValueTypes["TermsOfUseCreateInput"];
	["TermsOfUseUpdateInput"]: ValueTypes["TermsOfUseUpdateInput"];
	["TermsOfUseOrderByInput"]: ValueTypes["TermsOfUseOrderByInput"];
	["UserRole"]: ValueTypes["UserRole"];
	["UserWhereUniqueInput"]: ValueTypes["UserWhereUniqueInput"];
	["UserRoleNullableFilter"]: ValueTypes["UserRoleNullableFilter"];
	["UserWhereInput"]: ValueTypes["UserWhereInput"];
	["UserCreateInput"]: ValueTypes["UserCreateInput"];
	["UserUpdateInput"]: ValueTypes["UserUpdateInput"];
	["MyUserUpdateInput"]: ValueTypes["MyUserUpdateInput"];
	["MyUserPreferencesUpdateInput"]: ValueTypes["MyUserPreferencesUpdateInput"];
	["MyUserDeleteInput"]: ValueTypes["MyUserDeleteInput"];
	["UserOrderByInput"]: ValueTypes["UserOrderByInput"];
	["UserFilter"]: ValueTypes["UserFilter"];
}