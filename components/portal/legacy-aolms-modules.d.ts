declare module '*.jsx' {
  const component: React.ComponentType<Record<string, unknown>>;
  export default component;
}
