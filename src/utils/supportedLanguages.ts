
export interface Language {
  id: string;
  name: string;
  extension: string;
  mode: string;
  color: string;
  previewSupported: boolean;
}

export const supportedLanguages: Language[] = [
  {
    id: "html",
    name: "HTML",
    extension: "html",
    mode: "htmlmixed",
    color: "#e34c26",
    previewSupported: true
  },
  {
    id: "css",
    name: "CSS",
    extension: "css",
    mode: "css",
    color: "#264de4",
    previewSupported: true
  },
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    mode: "javascript",
    color: "#f0db4f",
    previewSupported: true
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: "ts",
    mode: "text/typescript",
    color: "#007acc",
    previewSupported: true
  },
  {
    id: "jsx",
    name: "JSX",
    extension: "jsx",
    mode: "jsx",
    color: "#61dafb",
    previewSupported: true
  },
  {
    id: "tsx",
    name: "TSX",
    extension: "tsx",
    mode: "text/typescript-jsx",
    color: "#007acc",
    previewSupported: true
  },
  {
    id: "python",
    name: "Python",
    extension: "py",
    mode: "python",
    color: "#3572A5",
    previewSupported: true
  },
  {
    id: "java",
    name: "Java",
    extension: "java",
    mode: "text/x-java",
    color: "#b07219",
    previewSupported: true
  },
  {
    id: "kotlin",
    name: "Kotlin",
    extension: "kt",
    mode: "text/x-kotlin",
    color: "#A97BFF",
    previewSupported: true
  },
  {
    id: "swift",
    name: "Swift",
    extension: "swift",
    mode: "swift",
    color: "#F05138",
    previewSupported: true
  },
  {
    id: "c",
    name: "C",
    extension: "c",
    mode: "text/x-csrc",
    color: "#555555",
    previewSupported: true
  },
  {
    id: "cpp",
    name: "C++",
    extension: "cpp",
    mode: "text/x-c++src",
    color: "#f34b7d",
    previewSupported: true
  },
  {
    id: "csharp",
    name: "C#",
    extension: "cs",
    mode: "text/x-csharp",
    color: "#178600",
    previewSupported: true
  },
  {
    id: "go",
    name: "Go",
    extension: "go",
    mode: "text/x-go",
    color: "#00ADD8",
    previewSupported: true
  },
  {
    id: "rust",
    name: "Rust",
    extension: "rs",
    mode: "rust",
    color: "#DEA584",
    previewSupported: true
  },
  {
    id: "dart",
    name: "Dart",
    extension: "dart",
    mode: "dart",
    color: "#00B4AB",
    previewSupported: true
  },
  {
    id: "php",
    name: "PHP",
    extension: "php",
    mode: "php",
    color: "#4F5D95",
    previewSupported: true
  },
  {
    id: "ruby",
    name: "Ruby",
    extension: "rb",
    mode: "ruby",
    color: "#701516",
    previewSupported: true
  },
  {
    id: "sql",
    name: "SQL",
    extension: "sql",
    mode: "sql",
    color: "#e38c00",
    previewSupported: true
  },
  {
    id: "markdown",
    name: "Markdown",
    extension: "md",
    mode: "markdown",
    color: "#083fa1",
    previewSupported: true
  }
];

export const getLanguageById = (id: string): Language => {
  const language = supportedLanguages.find(lang => lang.id === id);
  if (!language) {
    throw new Error(`Language ${id} not found`);
  }
  return language;
};

export const getLanguageByExtension = (extension: string): Language => {
  const language = supportedLanguages.find(lang => lang.extension === extension);
  if (!language) {
    throw new Error(`Language with extension ${extension} not found`);
  }
  return language;
};
