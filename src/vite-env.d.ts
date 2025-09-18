/// <reference types="vite/client" />

// Declaración para importar archivos GLB/GLTF si se necesitara en el futuro
declare module "*.glb" {
  const src: string;
  export default src;
}
declare module "*.gltf" {
  const src: string;
  export default src;
}
