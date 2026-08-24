/**
 * The canonical token contract — what every design-system adapter must produce.
 *
 * This is NOT a new schema. It is the schema `scripts/figma-tokens.json` already
 * has, written down as types so an adapter can be checked against it. Per the
 * repo convention (token-engine-architecture.md §0.7) it ships as a `.d.ts`
 * sidecar beside JSDoc-annotated `.js`, not as a TypeScript migration.
 *
 * See docs/design-system-adapters.md §3.
 */

/* ── provenance ────────────────────────────────────────────────────────────
   The mechanism that forbids silent substitution. Every value an adapter
   produces carries how it was arrived at, so "we guessed this" is a fact in the
   data rather than a footnote someone has to remember to write.              */

export type Confidence =
  /** The system states this value for this role. */
  | "exact"
  /** Computed from what it gave us, by a declared derivation. */
  | "derived"
  /** Nearest available. The two systems do not mean quite the same thing. */
  | "approximate"
  /** Our Standard value. The system had nothing here. */
  | "fallback"
  /** The system has no concept here. NEVER carries a value. */
  | "unsupported";

export interface Provenanced<T> {
  /** `null` if and only if `confidence === "unsupported"`. */
  value: T | null;
  confidence: Confidence;
  /** The foreign token this came from, e.g. `"fgColor.muted"`. */
  from?: string;
  /** REQUIRED when confidence is not `"exact"`. Says why. */
  note?: string;
}

/* ── tier 1 · primitives ─────────────────────────────────────────────────── */

export type RampStep =
  | "50" | "100" | "200" | "300" | "400" | "500"
  | "600" | "700" | "800" | "900" | "950";

export type Ramp = Record<RampStep, string>;

export interface CanonicalPrimitives {
  neutral: Ramp;
  /** The accent the `scheme` axis varies. Named `blue` in our source for
   *  historical reasons; an adapter writes whatever hue it brings. */
  blue: Ramp;
  orange: Ramp;
  success: Ramp;
  warning: Ramp;
  danger: Ramp;
  info: Ramp;
  white: string;
  black: string;
}

/* ── tier 2 · the 29 semantic roles ──────────────────────────────────────── */

/** Light and dark are BOTH required. A system with no dark mode declares that
 *  in `capabilities` and its adapter DERIVES one — it never omits the key,
 *  because a missing mode is indistinguishable from a broken one downstream. */
export interface ModePair {
  light: string;
  dark: string;
}

export type SurfaceRole = "canvas" | "base" | "raised" | "subtle" | "overlay";
export type TextRole = "primary" | "secondary" | "tertiary" | "disabled" | "on-brand";
export type BorderRole = "default" | "subtle" | "strong";
export type ActionState = "rest" | "hover" | "pressed";
export type StatusRole = "success" | "warning" | "danger" | "info";

/** Flat, slash-delimited, exactly as `figma-tokens.json` stores them. */
export type SemanticKey =
  | `surface/${SurfaceRole}`
  | `text/${TextRole}`
  | `border/${BorderRole}`
  | `action/primary/${ActionState}`
  /** The brand as an indicator rather than a fill. Derived, 3:1 against surface. */
  | "action/primary/indicator"
  | `action/accent/${ActionState}`
  | "focus/ring"
  | `status/${StatusRole}/foreground`
  | `status/${StatusRole}/background`;

/** In the SOURCE document a semantic value is an alias into primitives
 *  (`"blue.500"`); after resolution it is a hex. Adapters write aliases where
 *  they can and hex where the foreign system gives no ramp. */
export type CanonicalSemantic = Record<SemanticKey, ModePair>;

/* ── typography ──────────────────────────────────────────────────────────── */

export type TypeStyleId =
  | "display/xl" | "heading/2" | "heading/3"
  | "title/l" | "title/m"
  | "body/l" | "body/m" | "body/s"
  | "label/l" | "label/m" | "label/s"
  | "data/mono";

export interface TypeStyle {
  size: number;
  weight: number;
  lineHeight: number;
  tracking?: number;
}

export interface CanonicalTypography {
  fontFamily: string;
  styles: Record<TypeStyleId, TypeStyle>;
}

/* ── scale ───────────────────────────────────────────────────────────────── */

export type SpacingStep = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16";
export type RadiusStep = "none" | "sharp" | "control" | "surface" | "large" | "xl" | "pill";
export type ShadowLevel = "none" | "xs" | "sm" | "md" | "lg";

export interface ShadowValue {
  offsetY: number;
  blur: number;
  spread: number;
  /** A primitive alias, so it darkens correctly per mode. */
  color: string;
  alpha: number;
  /** DECLARED, never derived. A shadow is a shortfall of light, and `md` is
   *  0.10 against a light surface and 0.44 against a dark one. One global
   *  multiplier would quietly flatten every dark-mode Look. */
  darkAlpha: number;
}

export interface CanonicalScale {
  spacing: Record<SpacingStep, number>;
  radius: Record<RadiusStep, number>;
  shadow: Record<ShadowLevel, ShadowValue>;
  motion: { fast: number; medium: number; slow: number; easing: string };
  layout: Record<string, number>;
}

/* ── tier 3 · component slots ────────────────────────────────────────────── */

export type InteractionState =
  | "rest" | "hover" | "pressed" | "focus" | "disabled" | "selected";

export type SlotName =
  | "bg" | "fg" | "border" | "ring"
  | "radius" | "paddingInline" | "paddingBlock" | "minHeight" | "height"
  | "gap" | "borderWidth" | "labelType" | "shadow";

/** A slot points DOWN the tiers, never sideways and never up. */
export type SlotRef =
  | `{sem:${string}}`
  | `{space:${string}}`
  | `{radius:${string}}`
  | `{motion:${string}}`
  | `{layout:${string}}`
  | `{type:${string}}`
  | `{shadow:${string}}`
  | `{derive:${string}}`
  /** `{mix:a,b,9}` — 9% of role `a` composited over role `b`. Exists because a
   *  translucent value has no contrast ratio until you know its backdrop. */
  | `{mix:${string},${string},${number}}`
  /** Legal but LINTED for colours: it skips the only tier that knows the mode. */
  | `{prim:${string}}`
  | "transparent"
  | number;

export interface SlotSpec {
  $value: SlotRef;
  $type?: "color" | "dimension" | "typography" | "shadow";
  /** For the one honest case: a slot whose alias must change by mode because
   *  the token it points at collapses. */
  $darkValue?: SlotRef;
}

export interface ContractPair {
  fg: string;
  bg: string | "@surface";
  kind: "text" | "ui" | "decorative";
  typeToken?: TypeStyleId;
}

export interface ComponentContract {
  $label?: string;
  $note?: string;
  /** Marks that this component's border IDENTIFIES the control, so a border
   *  slot earns a 3:1 requirement. A row rule and a field outline look the same
   *  in code and are different under WCAG. */
  $borderRole?: "control" | "decorative";
  $base?: Partial<Record<SlotName, SlotSpec>>;
  $variants?: Record<string, {
    $label?: string;
    $knownDefect?: KnownDefect;
    $states?: Partial<Record<InteractionState, Partial<Record<SlotName, SlotSpec>> & {
      $knownDefect?: KnownDefect;
    }>>;
  }>;
  /** Rendered pairs. A slot with NO pair is unchecked, and unchecked reads
   *  exactly like compliant — so declaring a pair is part of declaring a slot. */
  $pairs?: ContractPair[];
}

export interface KnownDefect {
  note: string;
  owner: string;
  decision: string;
  until?: string;
}

/* ── the whole thing ─────────────────────────────────────────────────────── */

export interface CanonicalTokens {
  primitives: CanonicalPrimitives;
  semantic: CanonicalSemantic;
  type: CanonicalTypography;
  nonFigma: CanonicalScale;
  components: Record<string, ComponentContract>;
}

/** What an adapter returns: a SPARSE patch in the shape of the source document,
 *  which is the same shape a Look's `patch` uses and the same shape the token
 *  editor already exports. That identity is why no new resolver was needed. */
export type CanonicalPatch = DeepPartial<CanonicalTokens>;

/** The same patch with every leaf wrapped, for the adapter report. Kept
 *  separate from `CanonicalPatch` so the resolver never has to unwrap. */
export type ProvenancedPatch = DeepProvenanced<CanonicalTokens>;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
type DeepProvenanced<T> = {
  [K in keyof T]?: T[K] extends string | number
    ? Provenanced<T[K]>
    : T[K] extends object
      ? DeepProvenanced<T[K]>
      : Provenanced<T[K]>;
};

/* ── the adapter ─────────────────────────────────────────────────────────── */

export interface AdapterMetadata {
  upstreamVersion: string;
  /** The package or URL the values came from. */
  source: string;
  /** SPDX id. `null` means unlicensed — the registry REFUSES to list it. */
  licence: string | null;
  /** Rendered in the UI whenever `licence` is non-null. Machine-enforced, so
   *  nobody has to remember. */
  attribution: string | null;
  /** Whether the NAME may be shown in a tenant-facing build. A permissive
   *  licence grants copyright and patent rights, never trademark rights. */
  trademarkCleared: boolean;
  extractedOn: string;
}

export interface Capabilities {
  colorPrimitives: boolean;
  semanticColor: boolean;
  darkMode: boolean;
  typographyScale: boolean;
  typefaces: boolean;
  spacingScale: boolean;
  radiusScale: boolean;
  elevation: boolean;
  motion: boolean;
  componentTokens: boolean;
  interactionStates: boolean;
  cssVariables: boolean;
  runtimeThemeSwitch: boolean;
  density: boolean;
  rtl: boolean;
  highContrast: boolean;
  /** A PUBLISHED guarantee, not "we thought about it". */
  contrastGuarantee: "structural" | "documented" | "none";
}

export interface ValidationReport {
  ok: boolean;
  adapter: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  coverage: {
    semantic: { exact: number; derived: number; approximate: number; fallback: number; unsupported: number };
    /** Percentage of required canonical roles the system states directly. */
    directPercent: number;
  };
  unmappedCount: number;
}

export interface ValidationIssue {
  code:
    | "missing-required-role"
    | "note-required"
    | "no-licence"
    | "capability-contradiction"
    | "unsupported-with-value"
    | "unknown-key"
    | "bad-mode-pair";
  path: string;
  message: string;
}

export interface DesignSystemAdapter {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly metadata: AdapterMetadata;
  readonly capabilities: Capabilities;

  /* REQUIRED — the four that do the work. */
  normalize(raw: unknown): { tokens: unknown; warnings: string[] };
  map(tokens: unknown): { patch: CanonicalPatch; provenance: ProvenancedPatch; unmapped: Record<string, unknown> };
  fill(patch: CanonicalPatch): { patch: CanonicalPatch; derived: string[] };
  validate(patch: CanonicalPatch, provenance?: ProvenancedPatch): ValidationReport;

  /* OPTIONAL refinements. Omitting one is legal and means "fill() handles it". */
  getColorSystem?(): unknown;
  getTypography?(): Partial<CanonicalTypography>;
  getSpacing?(): Partial<CanonicalScale["spacing"]>;
  getRadius?(): Partial<CanonicalScale["radius"]>;
  getElevation?(): Partial<CanonicalScale["shadow"]>;
  getMotion?(): Partial<CanonicalScale["motion"]>;
  getComponentMapping?(): Record<string, Partial<ComponentContract>>;

  /* DELIBERATELY ABSENT: createTheme().
     An adapter that builds its own theme owns the runtime, and then two adapters
     own it differently and the audit can score only one of them. The adapter's
     entire output is a canonical patch; getTheme() stays the sole constructor.
     See docs/design-system-adapters.md §4.                                     */
}
