export type FieldAccess = "HIDDEN" | "MASKED" | "READ_ONLY" | "EDITABLE";

export type FieldProjection =
  | { readonly visible: false }
  | {
      readonly visible: true;
      readonly displayValue: string;
      readonly editable: boolean;
      readonly masked: boolean;
    };

export function projectField(
  value: string,
  access: FieldAccess,
): FieldProjection {
  switch (access) {
    case "HIDDEN":
      return { visible: false };
    case "MASKED":
      return {
        visible: true,
        displayValue: maskValue(value),
        editable: false,
        masked: true,
      };
    case "READ_ONLY":
      return {
        visible: true,
        displayValue: value,
        editable: false,
        masked: false,
      };
    case "EDITABLE":
      return {
        visible: true,
        displayValue: value,
        editable: true,
        masked: false,
      };
  }
}

function maskValue(value: string): string {
  if (value.length <= 4) return "••••";
  return `${"•".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;
}
