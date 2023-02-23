import { PgTheme } from "../interface";

// BG
const BG_BLACK = "#000000",
  // BG_WHITE = "#F9F9FB",
  BG_GRAY = "#18191E",
  // FG
  GREEN = "#14F195",
  PURPLE = "#9945FF",
  BLUE = "#80ECFF",
  PINK = "#EB54BC",
  ORANGE = "#F85228",
  RED = "#DC3545",
  YELLOW = "#FFC107",
  // TEXT
  TEXT_PRIMARY = "#FFFFFF",
  TEXT_SECONDARY = "#AAAAAA",
  // State
  DISABLED = "#111114",
  HOVER_BG = "#2B2D39",
  SELECTION = "#232323";

export const SOLANA: PgTheme = {
  name: "Solana",
  isDark: true,
  colors: {
    default: {
      bgPrimary: BG_BLACK,
      bgSecondary: BG_GRAY,
      borderColor: SELECTION,
      primary: GREEN,
      secondary: PURPLE,
      textPrimary: TEXT_PRIMARY,
      textSecondary: TEXT_SECONDARY,
    },
    state: {
      disabled: {
        bg: DISABLED,
        color: TEXT_SECONDARY,
      },
      error: {
        color: RED,
      },
      hover: {
        bg: HOVER_BG,
        color: "#91939e",
      },
      info: {
        color: BLUE,
      },
      success: {
        color: GREEN,
      },
      warning: { color: YELLOW },
    },
    bottom: {
      color: BG_BLACK,
    },
    editor: {
      bg: BG_GRAY,
      tooltip: {
        bg: BG_BLACK,
      },
      activeLine: {
        borderColor: SELECTION,
      },
      gutter: {
        color: TEXT_SECONDARY,
        activeColor: TEXT_PRIMARY,
      },
    },
    home: {
      bg: BG_BLACK,
      card: {
        bg: BG_GRAY,
      },
    },
    right: {
      bg: BG_BLACK,
      otherBg: BG_GRAY,
    },
    terminal: {
      bg: BG_GRAY,
    },
    tooltip: {
      bg: BG_GRAY,
      color: TEXT_PRIMARY,
      bgSecondary: BG_BLACK,
    },
    toast: {
      bg: BG_GRAY,
      color: TEXT_PRIMARY,
    },
    tutorial: {
      bg: BG_BLACK,
    },
    tutorials: {
      bg: BG_BLACK,
      card: {
        bg: BG_GRAY,
      },
    },
  },
  components: {
    button: {
      overrides: {
        primary: {
          color: BG_BLACK,
          hover: {
            color: TEXT_PRIMARY,
          },
        },
      },
    },
  },
  skeleton: {
    color: SELECTION,
    highlightColor: HOVER_BG,
  },
  highlight: {
    typeName: { color: BLUE, fontStyle: "italic" },
    variableName: { color: TEXT_PRIMARY },
    namespace: { color: BLUE },
    macroName: { color: GREEN },
    functionCall: { color: GREEN },
    functionDef: { color: GREEN },
    functionArg: { color: ORANGE },
    definitionKeyword: { color: PINK },
    moduleKeyword: { color: PINK },
    modifier: { color: PINK },
    controlKeyword: { color: PINK },
    operatorKeyword: { color: PINK },
    keyword: { color: PINK },
    self: { color: PINK },
    bool: { color: PURPLE },
    integer: { color: PURPLE },
    literal: { color: PURPLE },
    string: { color: YELLOW },
    character: { color: YELLOW },
    operator: { color: PINK },
    derefOperator: { color: PINK },
    specialVariable: { color: PURPLE },
    lineComment: { color: TEXT_SECONDARY },
    blockComment: { color: TEXT_SECONDARY },
    meta: { color: PURPLE },
    invalid: { color: RED },
    constant: { color: PURPLE },
    regexp: { color: ORANGE },
    tagName: { color: YELLOW },
    attributeName: { color: YELLOW },
    attributeValue: { color: YELLOW },
    annotion: { color: ORANGE },
  },
};
