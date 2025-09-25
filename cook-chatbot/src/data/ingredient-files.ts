export interface IngredientFile {
  filename: string
  path: string
  title: string
  content: string
}

export const INGREDIENT_FILES: IngredientFile[] = [
  {
    filename: "炒菜基料.md",
    path: "/配料/炒菜基料.md",
    title: "炒菜基料",
    content: `# 炒菜基料
## 已知成分
- 生抽、蒸鱼豉油、盐、蚝油等

详细成分与配比老乡鸡官方未公布，请依据个人口味适量调整`
  },
  {
    filename: "剁椒酱.md",
    path: "/配料/剁椒酱.md",
    title: "剁椒酱",
    content: `# 剁椒酱
## 成分
- 新鲜红椒
- 盐
- 蒜
- 生姜

## 制作方法
将新鲜红椒、蒜、生姜剁碎，加盐腌制发酵而成`
  },
  {
    filename: "家常小炒料.md",
    path: "/配料/家常小炒料.md",
    title: "家常小炒料",
    content: `# 家常小炒料
## 成分
- 生抽
- 老抽
- 料酒
- 盐
- 糖
- 胡椒粉

## 用途
适用于各种家常小炒菜品，提升菜品口感和色泽`
  },
  {
    filename: "小炒肉调味汁.md",
    path: "/配料/小炒肉调味汁.md",
    title: "小炒肉调味汁",
    content: `# 小炒肉调味汁
## 成分
- 生抽
- 老抽
- 料酒
- 蚝油
- 盐
- 糖

## 使用方法
在炒制肉类时加入，增加肉质嫩度和提升口感`
  },
  {
    filename: "小炒肉调料.md",
    path: "/配料/小炒肉调料.md",
    title: "小炒肉调料",
    content: `# 小炒肉调料

## 已知成分
- 老抽、海皇汁、青椒酱、白砂糖等

详细成分与配比老乡鸡官方未公布，请依据个人口味适量调整`
  }
]

export function findIngredientFile(path: string): IngredientFile | undefined {
  return INGREDIENT_FILES.find(file => file.path === path || file.filename === path || file.title === path)
}

export function getAllIngredientPaths(): string[] {
  return INGREDIENT_FILES.map(file => file.path)
}