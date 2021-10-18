export interface TreeNode {
  code: string; //name
  value: string; //id
  parent?: string;
  children?: TreeNode[];
  level: number;
}
