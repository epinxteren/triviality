
/**
 * Nothing interface.
 */
export interface Empty {
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Make all properties in T optional
 */
export type Optional<T> = Partial<T>;

/**
 * Should not define these properties for this type.
 */
export type NoDuplicates<T> = {
  [P in keyof T]?: never;
};

export type PromiseType<T> = T extends Promise<infer U> ? U : T extends (...args: any[]) => Promise<infer J> ? J : T;

export type PromiseOrValue<T> = T | Promise<T>;
