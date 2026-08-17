/**
 * Genus brand marks.
 *
 * ── The rule that matters ────────────────────────────────────────────────
 * These read from the blue and orange PRIMITIVES, never from
 * `action/primary`. A colour scheme changes the product's brand hue; it must
 * not repaint the company's logo. Picking "Forest" makes the buttons green and
 * leaves the Genus mark Genus blue.
 *
 * ── Why the marks lighten in dark mode ───────────────────────────────────
 * Measured against every dark surface, with `surface/raised` #333333 the
 * hardest case because it is the lightest of them:
 *
 *   blue-500  #0467b2 → 2.16:1   fails the 3:1 non-text floor
 *   blue-400  #5598d0 → 4.08:1   passes, still recognisably Genus blue
 *   blue-300  #80b2df → 5.63:1   passes, but reads pastel
 *
 * So dark mode steps both colours up exactly one stop. Orange-500 already
 * passes at 4.27:1 and did not strictly need it — but the two colours are one
 * lockup, and lifting only the blue would change their relationship to each
 * other. They move together or not at all.
 *
 * Light mode uses the brand values verbatim. Logotypes are exempt from WCAG
 * 1.4.11, which matters because orange-500 on `surface/subtle` is 2.60:1 — fine
 * for a logo, not fine for anything that has to be read as information.
 */
import { Box } from "@mui/material";
import { primitives } from "../lib/tokens.js";

/** Brand colours for a mode. Never scheme-dependent — see the module note. */
export function brandColors(mode) {
  const dark = mode === "dark";
  return {
    blue: dark ? primitives.blue[400] : primitives.blue[500],
    orange: dark ? primitives.orange[400] : primitives.orange[500],
  };
}

/* ── path data, lifted verbatim from the source SVGs ──────────────────────── */

const MARK_BLUE =
  "M17.888 32.6515C18.1749 34.3335 19.0767 35.849 20.4179 36.9038C21.7592 37.9586 23.4445 38.4775 25.1467 38.3598C26.4847 38.3797 27.8127 38.1267 29.0496 37.6162C30.2865 37.1057 31.4064 36.3484 32.3408 35.3906L37.1558 39.5463C35.6855 41.3161 33.8275 42.7236 31.7257 43.6598C29.6238 44.5959 27.3349 45.0356 25.0358 44.9446C17.0582 44.9446 10.942 40.0555 9.74951 32.6825L17.888 32.6515Z";

const MARK_ORANGE =
  "M17.869 27.5441C18.5404 23.7795 20.8345 21.3206 24.3594 21.3206C27.9368 21.3206 30.1787 23.8332 30.6795 27.5441H17.869ZM24.3594 14.6655C15.6282 14.6655 9.52991 21.5401 9.52991 29.8897V29.997C9.53027 30.8952 9.60188 31.7919 9.7436 32.6789H38.7202C38.7213 32.695 38.7254 32.7107 38.7322 32.7254H38.8515C38.9052 31.9598 38.9636 31.4721 38.9636 30.6505V30.542C38.9636 22.2484 34.3738 14.6655 24.3571 14.6655H24.3594ZM32.0272 5.22358C32.776 5.58132 33.1588 6.31587 32.8869 6.85128L31.1864 10.1902C30.9746 10.4658 30.6667 10.6514 30.3241 10.71C29.9815 10.7686 29.6293 10.6958 29.338 10.5062C28.5892 10.1484 28.2052 9.41509 28.4795 8.87848L30.18 5.53958C30.3917 5.26396 30.6997 5.07833 31.0423 5.01975C31.3849 4.96118 31.7359 5.03396 32.0272 5.22358ZM42.8249 13.1403C43.0326 13.4118 43.1262 13.7537 43.0857 14.0931C43.0452 14.4326 42.8735 14.7427 42.6077 14.9577L39.2868 16.8C38.9601 16.9157 38.6019 16.9035 38.2838 16.7659C37.9658 16.6284 37.7114 16.3756 37.572 16.0583C37.3615 15.7871 37.2667 15.4438 37.308 15.1031C37.3493 14.7623 37.5235 14.4516 37.7927 14.2386L41.1089 12.395C41.4361 12.2802 41.7945 12.2931 42.1125 12.4313C42.4304 12.5696 42.6857 12.8228 42.8249 13.1403ZM6.27335 13.1403C6.06332 13.411 5.96844 13.7536 6.00929 14.0938C6.05014 14.434 6.22355 14.7444 6.49169 14.9577L9.80794 16.8C10.1351 16.9156 10.4938 16.9034 10.8123 16.7659C11.1309 16.6283 11.3859 16.3757 11.5262 16.0583C11.7343 15.7862 11.8277 15.4436 11.7865 15.1035C11.7452 14.7635 11.5726 14.4531 11.3055 14.2386L7.98693 12.395C7.6598 12.2802 7.30139 12.2931 6.98341 12.4313C6.66543 12.5696 6.41254 12.8228 6.27335 13.1403ZM16.7027 5.38932C15.9551 5.74706 15.5724 6.48282 15.843 7.01704L17.5447 10.3559C17.7565 10.6319 18.0645 10.8177 18.4073 10.8765C18.7501 10.9353 19.1026 10.8627 19.3942 10.6731C20.1419 10.3154 20.5247 9.58204 20.2516 9.04543L18.5523 5.70653C18.3396 5.43162 18.0312 5.24683 17.6885 5.18894C17.3458 5.13105 16.9939 5.20429 16.7027 5.39409V5.38932Z";

const WORDMARK_BLUE =
  "M20.3682 39.9547C8.30051 39.9547 0 31.6969 0 20.5175V20.4114C0 9.67205 8.57851 0.872864 20.3123 0.872864C27.2871 0.872864 31.494 2.70926 35.5329 6.05412L30.1668 12.3742C27.4142 9.83232 23.7827 8.45792 20.0369 8.54041C13.8361 8.54041 8.91233 13.885 8.91233 20.3076V20.4162C8.91233 27.3253 13.7813 32.3968 20.6463 32.3968C23.4902 32.4839 26.2919 31.6928 28.6704 30.1311V24.7329H20.0917V17.5495H36.9198V33.9566C32.2881 37.8542 26.4216 39.9785 20.3682 39.9499V39.9547ZM151.765 39.8473C147.159 39.817 142.689 38.2819 139.036 35.4758L142.634 30.0775C145.337 32.1372 148.593 33.3416 151.985 33.5356C154.421 33.5356 155.528 32.6723 155.528 31.3785V31.2628C155.528 29.4741 152.651 28.8886 149.383 27.9155C145.234 26.7302 140.527 24.839 140.527 19.2261V19.1176C140.527 13.2339 145.398 9.94154 151.378 9.94154C155.309 9.99423 159.145 11.1544 162.446 13.2888L159.236 18.9542C156.815 17.4248 154.063 16.4993 151.21 16.2556C149.163 16.2556 148.11 17.119 148.11 18.2542V18.3603C148.11 19.9785 150.935 20.7357 154.145 21.8185C158.295 23.1672 163.112 25.1097 163.112 30.4042V30.5127C163.112 36.9353 158.184 39.8521 151.763 39.8521L151.765 39.8473ZM128.023 39.3083V35.2063C126.085 37.6341 123.594 39.8485 119.333 39.8485C112.967 39.8485 109.258 35.7453 109.258 29.1056V10.3756H117.673V26.5132C117.673 30.3995 119.556 32.3968 122.763 32.3968C125.969 32.3968 128.022 30.3995 128.022 26.5132V10.3756H136.433V39.3072L128.023 39.3083ZM97.0009 39.3083V23.1672C97.0009 19.2809 95.118 17.2835 91.9079 17.2835C88.6978 17.2835 86.649 19.2809 86.649 23.1672V39.3072H78.2374V10.3756H86.649V14.4777C88.5879 12.0498 91.0779 9.83661 95.3386 9.83661C101.705 9.83661 105.413 13.9375 105.413 20.5771V39.3072L97.0009 39.3083ZM50.6497 27.6282C50.9366 29.3102 51.8384 30.8257 53.1796 31.8805C54.5209 32.9353 56.2062 33.4542 57.9084 33.3365C59.2464 33.3564 60.5744 33.1034 61.8113 32.5929C63.0482 32.0823 64.1681 31.3251 65.1025 30.3672L69.9175 34.523C68.4472 36.2928 66.5892 37.7003 64.4874 38.6365C62.3855 39.5726 60.0966 40.0122 57.7975 39.9213C49.8199 39.9213 43.7037 35.0322 42.5112 27.6592L50.6497 27.6282Z";

const WORDMARK_ORANGE =
  "M50.6307 22.5209C51.3021 18.7563 53.5962 16.2974 57.1212 16.2974C60.6985 16.2974 62.9404 18.8099 63.4413 22.5209H50.6307ZM57.1212 9.64225C48.3899 9.64225 42.2916 16.5168 42.2916 24.8664V24.9738C42.292 25.8719 42.3636 26.7687 42.5053 27.6556H71.482C71.4831 27.6717 71.4871 27.6875 71.4939 27.7021H71.6133C71.6669 26.9366 71.7253 26.4488 71.7253 25.6272V25.5187C71.7253 17.2251 67.1355 9.64225 57.1188 9.64225H57.1212ZM64.7889 0.200326C65.5378 0.558065 65.9205 1.29261 65.6486 1.82803L63.9481 5.16693C63.7364 5.44256 63.4284 5.62818 63.0858 5.68676C62.7432 5.74533 62.3911 5.67255 62.0997 5.48293C61.3509 5.12519 60.9669 4.39184 61.2412 3.85523L62.9417 0.516328C63.1535 0.240701 63.4614 0.0550755 63.804 -0.00350028C64.1466 -0.062076 64.4976 0.0107075 64.7889 0.200326ZM75.5866 8.11708C75.7943 8.38855 75.888 8.73042 75.8474 9.06986C75.8069 9.4093 75.6352 9.71949 75.3694 9.9344L72.0485 11.7768C71.7218 11.8924 71.3636 11.8803 71.0456 11.7427C70.7275 11.6051 70.4731 11.3523 70.3337 11.035C70.1232 10.7639 70.0284 10.4206 70.0697 10.0798C70.111 9.73902 70.2852 9.42835 70.5544 9.21535L73.8707 7.37179C74.1978 7.25693 74.5562 7.26989 74.8742 7.40809C75.1922 7.5463 75.4474 7.79954 75.5866 8.11708ZM39.0351 8.11708C38.825 8.38779 38.7302 8.73036 38.771 9.07055C38.8119 9.41073 38.9853 9.72111 39.2534 9.9344L42.5697 11.7768C42.8968 11.8923 43.2555 11.8801 43.5741 11.7426C43.8926 11.6051 44.1476 11.3524 44.2879 11.035C44.496 10.763 44.5894 10.4203 44.5482 10.0803C44.5069 9.74024 44.3343 9.42981 44.0672 9.21535L40.7486 7.37179C40.4215 7.25693 40.0631 7.26989 39.7451 7.40809C39.4271 7.5463 39.1743 7.79954 39.0351 8.11708ZM49.4645 0.36607C48.7168 0.723809 48.3341 1.45957 48.6048 1.99379L50.3064 5.33269C50.5182 5.6086 50.8262 5.79449 51.169 5.85328C51.5118 5.91208 51.8643 5.83944 52.1559 5.64988C52.9036 5.29214 53.2864 4.55878 53.0133 4.02217L51.314 0.683273C51.1013 0.408365 50.7929 0.223573 50.4502 0.165682C50.1075 0.107791 49.7556 0.181035 49.4645 0.370837V0.36607Z";

/* ── components ───────────────────────────────────────────────────────────── */

/**
 * The glyph on its own.
 *
 * `plate` draws the rounded container the source SVG ships with. It defaults to
 * OFF, because a white plate in a dark sidebar is a bright blob that takes the
 * emphasis budget the navigation needs. Turn it on for a contained lockup —
 * an app icon, a login card, anything sitting on an unknown background.
 */
export function GenusMark({ size = 28, plate = false, title = "Genus", sx }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 50 50"
      role="img"
      aria-label={title}
      sx={(t) => {
        const c = brandColors(t.palette.mode);
        return {
          width: size,
          height: size,
          flexShrink: 0,
          display: "block",
          "& .genus-plate": {
            fill: plate ? t.palette.surface.raised : "transparent",
            stroke: plate ? t.palette.border.subtle : "transparent",
          },
          "& .genus-blue": { fill: c.blue },
          "& .genus-orange": { fill: c.orange },
          ...sx,
        };
      }}
    >
      <rect className="genus-plate" x="0.5" y="0.5" width="49" height="49" rx="10" />
      <path className="genus-blue" fillRule="evenodd" clipRule="evenodd" d={MARK_BLUE} />
      <path className="genus-orange" fillRule="evenodd" clipRule="evenodd" d={MARK_ORANGE} />
    </Box>
  );
}

/**
 * The "genus" wordmark. Transparent background — it sits on the surface.
 *
 * The viewBox is TIGHTENED to the artwork. The source file declares 164×60 but
 * getBBox reports the content as 163.11 × 39.98 — a third of the source box is
 * empty space below the glyph. Rendering the source viewBox meant `height={20}`
 * produced a 13px glyph sitting on 7px of nothing, which is why it looked
 * undersized and mis-baselined beside text. With the tight box, `height` is the
 * glyph height.
 */
export function GenusWordmark({ height = 22, title = "Genus", sx }) {
  return (
    <Box
      component="svg"
      viewBox="0 -0.02 163.11 39.98"
      role="img"
      aria-label={title}
      sx={(t) => {
        const c = brandColors(t.palette.mode);
        return {
          height,
          width: "auto",
          flexShrink: 0,
          display: "block",
          "& .genus-blue": { fill: c.blue },
          "& .genus-orange": { fill: c.orange },
          ...sx,
        };
      }}
    >
      <path className="genus-blue" fillRule="evenodd" clipRule="evenodd" d={WORDMARK_BLUE} />
      <path className="genus-orange" fillRule="evenodd" clipRule="evenodd" d={WORDMARK_ORANGE} />
    </Box>
  );
}

/**
 * The shell header lockup — ONE mark at a time.
 *
 *   expanded → wordmark + product name
 *   compact  → mark only
 *
 * Never both. The mark is a monogram of the same "e + sun" motif the wordmark
 * already contains, so showing them side by side states the brand twice and
 * reads as clutter rather than as emphasis. The mark exists precisely for the
 * places the wordmark will not fit — the mini rail, a favicon, an app icon.
 *
 * The wordmark is the company; the product name beside it is this application.
 * They stay visually distinct so "Genus Solar" does not read as one word.
 */
export function GenusLockup({ product = "Solar", subtitle, compact = false, sx }) {
  if (compact) return <GenusMark size={28} sx={sx} />;

  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      {/* The wordmark artwork has no right side bearing, so a 6px gap renders
          as barely more than a word space and "GenusSolar" reads as one word.
          10px is the smallest gap at which the two register as separate. */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.25, minWidth: 0 }}>
        <GenusWordmark height={19} />
        {product && (
          <Box
            component="span"
            sx={(t) => ({
              ...t.typography.h5,
              color: t.palette.text.primary,
              whiteSpace: "nowrap",
            })}
          >
            {product}
          </Box>
        )}
      </Box>
      {subtitle && (
        <Box
          component="span"
          sx={(t) => ({
            display: "block",
            ...t.typography.caption,
            color: t.palette.text.tertiary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mt: 0.25,
          })}
        >
          {subtitle}
        </Box>
      )}
    </Box>
  );
}
