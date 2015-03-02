export interface Screen {
    name: string;

    update(): void;

    onActivate<TActivateParams>(params: TActivateParams): void;
    onDeactivate(): void;
}