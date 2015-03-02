export interface EntityFactory<TEntity, TCreateParams> {
    create(params: TCreateParams): TEntity;
}