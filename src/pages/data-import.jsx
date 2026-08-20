/**
 * Data — Import.
 *
 * The dry run is real. It parses the file you choose, in the browser, and the
 * report comes from the actual bytes — a mocked validation report would tell
 * you nothing about your file, which is the only thing this screen exists to
 * tell you.
 *
 * Commit is not built, because there is nowhere to commit to
 * (dms-parity-plan.md Phase 5). The screen is explicit about the boundary
 * rather than showing a greyed-out Commit that implies a permissions problem.
 *
 * The plan's sequencing is honoured exactly: validate BEFORE commit, never
 * after. The consumer master arrived as 9,673 rows in one load, and finding a
 * malformed date afterwards would mean unpicking it with no batch id to unpick
 * by — which is the gap /data/history documents.
 */
import { useCallback, useRef, useState } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { WsPage, WsContext, WsSection, WsTable, wsCols } from "../components/workspaces.jsx";
import { StatusChip, EmptyState, SectionLabel } from "../components/atoms.jsx";
import { KpiDeck, KpiTile } from "../components/molecules.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { SCHEMAS, dryRun } from "../lib/import-schemas.js";
import { announce } from "../components/organisms/shell.jsx";
import { exInt } from "../lib/format.js";

const SEVERITY_TONE = { error: "danger", warning: "warning", info: "neutral" };

export default function DataImport() {
  const { node, pathLabel } = useHierarchy();
  const inputRef = useRef(null);

  const [schemaId, setSchemaId] = useState(SCHEMAS[0].id);
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [readError, setReadError] = useState(null);

  const schema = SCHEMAS.find((s) => s.id === schemaId);

  const onPick = useCallback(
    async (e) => {
      const picked = e.target.files?.[0];
      // Reset immediately so re-picking the SAME file after an edit still fires
      // a change event — otherwise the second run silently does nothing.
      e.target.value = "";
      if (!picked) return;

      setFile(picked);
      setReport(null);
      setReadError(null);
      setBusy(true);
      try {
        const text = await picked.text();
        const result = dryRun(text, schemaId);
        setReport(result);
        announce(
          result.fatal
            ? `Dry run could not read ${picked.name}.`
            : `Dry run finished: ${result.counts.error} errors, ${result.counts.warning} warnings across ${result.rowCount} rows.`,
        );
      } catch (err) {
        setReadError(err?.message ?? "The file could not be read.");
      } finally {
        setBusy(false);
      }
    },
    [schemaId],
  );

  const reset = () => {
    setFile(null);
    setReport(null);
    setReadError(null);
  };

  return (
    <WsPage
      title="Import"
      subtitle="Choose a file and it is validated in your browser against the schema below. The report is generated from your actual file — nothing is uploaded, and nothing is committed."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Data", href: "/data/import" },
        { label: "Import" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Schemas", value: `${exInt(SCHEMAS.length)} accepted` },
            { label: "Commit", value: "Not available" },
          ]}
        />
      }
      actions={
        report && (
          <Button size="small" variant="outlined" onClick={reset}>
            Clear report
          </Button>
        )
      }
    >
      <Alert severity="info" variant="outlined">
        <strong>Validation runs, commit does not.</strong> The dry run below is genuine — your file
        is parsed locally and every finding comes from its contents. Writing the rows needs an
        ingest endpoint, which does not exist yet (dms-parity-plan.md Phase&nbsp;5), so no commit
        control is shown rather than a disabled one.
      </Alert>

      <WsSection title="Choose a file" note="Nothing leaves your browser — the file is read in memory">
        <Stack sx={{ gap: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 2, alignItems: { sm: "flex-start" } }}>
            <TextField
              select
              size="small"
              label="Schema"
              value={schemaId}
              onChange={(e) => {
                setSchemaId(e.target.value);
                reset();
              }}
              helperText={schema.note}
              sx={{ minWidth: 260 }}
            >
              {SCHEMAS.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Button
                variant="contained"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                {busy ? "Validating…" : "Choose CSV and dry-run"}
              </Button>
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.tertiary" }}>
                Expected file: {schema.file}
              </Typography>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={onPick}
                style={{ display: "none" }}
                aria-hidden="true"
                tabIndex={-1}
              />
            </Box>
          </Stack>

          {file && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Last read: <strong>{file.name}</strong> · {exInt(file.size)} bytes
            </Typography>
          )}

          {readError && (
            <Alert severity="error" variant="outlined">
              {readError}
            </Alert>
          )}
        </Stack>
      </WsSection>

      <WsSection
        title="Expected schema"
        note={`${schema.columns.length} columns · keyed on ${schema.keyColumn}`}
        padded={false}
      >
        <Box sx={{ p: 2, pt: 1.5 }}>
          <SectionLabel>Required columns</SectionLabel>
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", mt: 1 }}>
            {schema.columns.map((c) => (
              <StatusChip
                key={c.name}
                label={c.unique ? `${c.name} · unique` : c.name}
                tone={c.unique ? "info" : "neutral"}
              />
            ))}
          </Stack>
        </Box>
      </WsSection>

      {report?.fatal && (
        <Alert severity="error" variant="outlined">
          {report.fatal}
        </Alert>
      )}

      {report && !report.fatal && (
        <>
          <KpiDeck>
            <KpiTile
              label="Rows read"
              value={report.rowCount}
              tone="info"
              icon={<PlaylistAddCheckOutlinedIcon />}
              freshness={`Excluding the header, from ${file?.name ?? "the chosen file"}`}
            />
            <KpiTile
              label="Rows that would import"
              value={report.stoppedEarly ? null : report.cleanRows}
              tone={report.ok ? "good" : "warning"}
              icon={<PlaylistAddCheckOutlinedIcon />}
              notConfigured={report.stoppedEarly}
              freshness={
                report.stoppedEarly
                  ? "Not counted — the header is missing required columns"
                  : "Rows with no error against this schema"
              }
            />
            <KpiTile
              label="Errors"
              value={report.counts.error}
              tone={report.counts.error ? "warning" : "good"}
              icon={<ErrorOutlineOutlinedIcon />}
              freshness={
                report.counts.error ? "Would block the import" : "Nothing blocking in this file"
              }
            />
            <KpiTile
              label="Warnings"
              value={report.counts.warning}
              tone={report.counts.warning ? "warning" : "good"}
              icon={<WarningAmberOutlinedIcon />}
              freshness="Would import, but worth reading first"
            />
          </KpiDeck>

          <Alert severity={report.ok ? "success" : "error"} variant="outlined">
            {report.ok ? (
              <>
                <strong>This file would import cleanly.</strong> {exInt(report.cleanRows)} of{" "}
                {exInt(report.rowCount)} rows pass every rule for {schema.label}.
                {report.counts.warning > 0 &&
                  ` ${exInt(report.counts.warning)} warnings are non-blocking but worth reading.`}
              </>
            ) : (
              <>
                <strong>This file would not import.</strong> {exInt(report.counts.error)} errors
                across {exInt(report.rowCount)} rows.
                {report.stoppedEarly &&
                  " Row checks were skipped — the header is missing required columns, so per-field results would be noise."}
              </>
            )}
          </Alert>

          {report.findings.length > 0 ? (
            <WsTable
              title="Dry-run findings"
              note="Row numbers are 1-based and include the header, matching what a spreadsheet shows"
              exportName="dry-run-findings"
              pageSize={25}
              cols={wsCols([
                [
                  "severity",
                  "Severity",
                  {
                    width: 120,
                    renderCell: ({ value }) => (
                      <StatusChip label={value} tone={SEVERITY_TONE[value] ?? "neutral"} />
                    ),
                  },
                ],
                ["kind", "Finding", { width: 170 }],
                [
                  "row",
                  "Row",
                  { width: 90, align: "right", type: "number", valueGetter: (v) => v ?? "" },
                ],
                ["column", "Column", { width: 190, valueGetter: (v) => v ?? "—" }],
                [
                  "message",
                  "Detail",
                  {
                    width: 640,
                    renderCell: ({ value }) => (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {value}
                      </Typography>
                    ),
                  },
                ],
              ])}
              rows={report.findings}
            />
          ) : (
            <WsSection padded={false}>
              <EmptyState
                title="No findings"
                body="Every row passed every rule for this schema. There is nothing to review before a commit — which is still not available."
                minHeight={200}
              />
            </WsSection>
          )}
        </>
      )}

      {!report && !busy && (
        <WsSection padded={false}>
          <EmptyState
            icon={<UploadFileOutlinedIcon sx={{ fontSize: 32 }} />}
            title="No file validated yet"
            body={`Choose a ${schema.file} above. It is parsed in your browser and checked against the ${schema.columns.length} columns listed — required fields, both source date formats, consumer-number shape, Null Island coordinates, and duplicate keys.`}
            minHeight={240}
          />
        </WsSection>
      )}
    </WsPage>
  );
}
