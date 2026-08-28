import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAvailabilityException,
  createAvailabilityRule,
  deleteAvailabilityException,
  deleteAvailabilityRule,
  getAdminAvailabilityExceptions,
  getAdminAvailabilityRules,
  updateAvailabilityException,
  updateAvailabilityRule,
} from "../../services/availabilityAdminService";

/* ============================================
   CONSTANTS
============================================ */

const DEFAULT_TIMEZONE =
  "America/Santiago";

const SLOT_INTERVALS = [
  15,
  30,
  60,
];

const DAYS = [
  {
    value: 1,
    short: "Lun",
    label: "Lunes",
  },
  {
    value: 2,
    short: "Mar",
    label: "Martes",
  },
  {
    value: 3,
    short: "Mié",
    label: "Miércoles",
  },
  {
    value: 4,
    short: "Jue",
    label: "Jueves",
  },
  {
    value: 5,
    short: "Vie",
    label: "Viernes",
  },
  {
    value: 6,
    short: "Sáb",
    label: "Sábado",
  },
  {
    value: 7,
    short: "Dom",
    label: "Domingo",
  },
];

const EMPTY_RULE = {
  day_of_week: 1,
  start_time: "09:00",
  end_time: "18:00",
  timezone: DEFAULT_TIMEZONE,
  slot_interval_minutes: 30,
  effective_from: "",
  effective_to: "",
  is_active: true,
};

const EMPTY_EXCEPTION = {
  exception_date: "",
  exception_type: "BLOCKED",
  full_day: true,
  start_time: "",
  end_time: "",
  timezone: DEFAULT_TIMEZONE,
  slot_interval_minutes: 30,
  reason: "",
  repeats_yearly: false,
  is_active: true,
};

/* ============================================
   PAGE
============================================ */

function AvailabilityAdminPage() {
  const [rules, setRules] =
    useState([]);

  const [
    exceptions,
    setExceptions,
  ] = useState([]);

  const [activeTab, setActiveTab] =
    useState("WEEKLY");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [ruleModal, setRuleModal] =
    useState(null);

  const [
    exceptionModal,
    setExceptionModal,
  ] = useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        rulesData,
        exceptionsData,
      ] = await Promise.all([
        getAdminAvailabilityRules(),
        getAdminAvailabilityExceptions(),
      ]);

      setRules(
        extractCollection(
          rulesData,
          [
            "rules",
            "availability_rules",
            "availabilityRules",
          ]
        )
      );

      setExceptions(
        extractCollection(
          exceptionsData,
          [
            "exceptions",
            "availability_exceptions",
            "availabilityExceptions",
          ]
        )
      );
    } catch (error) {
      console.error(
        "Error cargando disponibilidad:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "No fue posible cargar la configuración de disponibilidad."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ============================================
     METRICS
  ============================================ */

  const metrics =
    useMemo(() => {
      const activeRules =
        rules.filter(
          (rule) =>
            rule.is_active
        );

      const activeDays =
        new Set(
          activeRules.map(
            (rule) =>
              Number(
                rule.day_of_week
              )
          )
        ).size;

      const activeExceptions =
        exceptions.filter(
          (exception) =>
            exception.is_active
        );

      return {
        activeRules:
          activeRules.length,

        activeDays,

        blocked:
          activeExceptions.filter(
            (exception) =>
              exception.exception_type ===
              "BLOCKED"
          ).length,

        annual:
          activeExceptions.filter(
            (exception) =>
              exception.repeats_yearly
          ).length,
      };
    }, [
      rules,
      exceptions,
    ]);

  const groupedRules =
    useMemo(() => {
      const map = new Map();

      DAYS.forEach((day) => {
        map.set(day.value, []);
      });

      rules.forEach((rule) => {
        const day =
          Number(
            rule.day_of_week
          );

        if (!map.has(day)) {
          map.set(day, []);
        }

        map.get(day).push(
          rule
        );
      });

      for (
        const dayRules of
        map.values()
      ) {
        dayRules.sort(
          (a, b) =>
            String(
              a.start_time
            ).localeCompare(
              String(
                b.start_time
              )
            )
        );
      }

      return map;
    }, [rules]);

  const sortedExceptions =
    useMemo(() => {
      return [...exceptions].sort(
        (a, b) => {
          const dateCompare =
            String(
              a.exception_date
            ).localeCompare(
              String(
                b.exception_date
              )
            );

          if (dateCompare) {
            return dateCompare;
          }

          return String(
            a.start_time || ""
          ).localeCompare(
            String(
              b.start_time || ""
            )
          );
        }
      );
    }, [exceptions]);

  return (
    <div className="min-h-full">
      {/* ========================================
          HEADER
      ======================================== */}

      <div
        className="
          flex
          flex-col
          gap-6
          border-b
          border-[var(--theme-border)]
          pb-8
          xl:flex-row
          xl:items-end
          xl:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[var(--theme-text-secondary)]
            "
          >
            Agenda
          </p>

          <h1
            className="
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.04em]
              text-[var(--theme-text-primary)]
            "
          >
            Disponibilidad
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-[var(--theme-text-secondary)]
            "
          >
            Define la disponibilidad
            semanal general de las
            asesorías y administra
            bloqueos o aperturas
            excepcionales.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="
            rounded-xl
            border
            border-[var(--theme-border)]
            px-5
            py-3
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
            transition
            hover:border-[var(--theme-border-strong)]
            hover:bg-[var(--theme-accent-soft)]
            hover:text-[var(--theme-text-primary)]
            disabled:opacity-40
          "
        >
          {loading
            ? "Actualizando..."
            : "Actualizar"}
        </button>
      </div>

      {/* ========================================
          METRICS
      ======================================== */}

      <div
        className="
          mt-8
          grid
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Bloques activos"
          value={
            metrics.activeRules
          }
        />

        <MetricCard
          label="Días habilitados"
          value={
            metrics.activeDays
          }
        />

        <MetricCard
          label="Bloqueos"
          value={
            metrics.blocked
          }
        />

        <MetricCard
          label="Anuales"
          value={
            metrics.annual
          }
        />
      </div>

      {/* ========================================
          TABS
      ======================================== */}

      <div
        className="
          mt-8
          flex
          flex-col
          gap-4
          border-b
          border-[var(--theme-border)]
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex gap-1">
          <TabButton
            active={
              activeTab ===
              "WEEKLY"
            }
            onClick={() =>
              setActiveTab(
                "WEEKLY"
              )
            }
          >
            Semana
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "EXCEPTIONS"
            }
            onClick={() =>
              setActiveTab(
                "EXCEPTIONS"
              )
            }
          >
            Excepciones
          </TabButton>
        </div>

        <div className="pb-4">
          {activeTab ===
          "WEEKLY" ? (
            <button
              type="button"
              onClick={() =>
                setRuleModal({
                  mode: "create",
                  item: null,
                })
              }
              className="
                rounded-xl
                bg-[var(--theme-accent)]
                px-5
                py-3
                text-sm
                font-semibold
                text-[var(--theme-bg-page)]
                transition
                hover:bg-[var(--theme-accent-hover)]
              "
            >
              Nuevo bloque
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setExceptionModal(
                  {
                    mode: "create",
                    item: null,
                  }
                )
              }
              className="
                rounded-xl
                bg-[var(--theme-accent)]
                px-5
                py-3
                text-sm
                font-semibold
                text-[var(--theme-bg-page)]
                transition
                hover:bg-[var(--theme-accent-hover)]
              "
            >
              Nueva excepción
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-[var(--theme-danger)]
            bg-[var(--theme-danger-soft)]
            px-5
            py-4
            text-sm
            text-[var(--theme-danger)]
          "
        >
          {error}
        </div>
      )}

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="mt-6">
        {loading ? (
          <AvailabilitySkeleton />
        ) : activeTab ===
          "WEEKLY" ? (
          <WeeklyRules
            groupedRules={
              groupedRules
            }
            onCreateForDay={(
              day
            ) =>
              setRuleModal({
                mode: "create",
                item: {
                  ...EMPTY_RULE,
                  day_of_week:
                    day,
                },
              })
            }
            onEdit={(item) =>
              setRuleModal({
                mode: "edit",
                item,
              })
            }
          />
        ) : (
          <ExceptionsList
            exceptions={
              sortedExceptions
            }
            onEdit={(item) =>
              setExceptionModal(
                {
                  mode: "edit",
                  item,
                }
              )
            }
          />
        )}
      </div>

      {/* ========================================
          MODALS
      ======================================== */}

      {ruleModal && (
        <RuleModal
          {...ruleModal}
          onClose={() =>
            setRuleModal(null)
          }
          onSaved={async () => {
            await loadData();
            setRuleModal(null);
          }}
        />
      )}

      {exceptionModal && (
        <ExceptionModal
          {...exceptionModal}
          onClose={() =>
            setExceptionModal(null)
          }
          onSaved={async () => {
            await loadData();
            setExceptionModal(null);
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   WEEKLY RULES
============================================ */

function WeeklyRules({
  groupedRules,
  onCreateForDay,
  onEdit,
}) {
  return (
    <div
      className="
        grid
        gap-4
        xl:grid-cols-2
      "
    >
      {DAYS.map((day) => {
        const dayRules =
          groupedRules.get(
            day.value
          ) || [];

        return (
          <article
            key={day.value}
            className="
              rounded-2xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-card)]
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[var(--theme-border)]
                    bg-[var(--theme-border)]
                    text-xs
                    font-semibold
                    text-[var(--theme-text-secondary)]
                  "
                >
                  {day.short}
                </div>

                <div>
                  <h2
                    className="
                      text-sm
                      font-semibold
                      text-[var(--theme-text-primary)]
                    "
                  >
                    {day.label}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--theme-text-subtle)]
                    "
                  >
                    {dayRules.length}{" "}
                    {dayRules.length ===
                    1
                      ? "bloque"
                      : "bloques"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onCreateForDay(
                    day.value
                  )
                }
                className="
                  rounded-lg
                  border
                  border-[var(--theme-border)]
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                  transition
                  hover:border-[var(--theme-border-strong)]
                  hover:text-[var(--theme-text-primary)]
                "
              >
                + Bloque
              </button>
            </div>

            <div
              className="
                mt-5
                space-y-2
              "
            >
              {dayRules.length ===
              0 ? (
                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-[var(--theme-border)]
                    px-4
                    py-6
                    text-center
                    text-xs
                    text-[var(--theme-text-subtle)]
                  "
                >
                  Sin disponibilidad
                </div>
              ) : (
                dayRules.map(
                  (rule) => (
                    <RuleRow
                      key={
                        rule.id
                      }
                      rule={rule}
                      onEdit={() =>
                        onEdit(
                          rule
                        )
                      }
                    />
                  )
                )
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RuleRow({
  rule,
  onEdit,
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="
        flex
        w-full
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        px-4
        py-3.5
        text-left
        transition
        hover:border-[var(--theme-border-strong)]
      "
    >
      <div>
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-[var(--theme-text-primary)]
            "
          >
            {formatTime(
              rule.start_time
            )}{" "}
            —{" "}
            {formatTime(
              rule.end_time
            )}
          </p>

          <StatusBadge
            active={
              rule.is_active
            }
          />
        </div>

        <p
          className="
            mt-1.5
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          Slots cada{" "}
          {rule.slot_interval_minutes}{" "}
          min ·{" "}
          {rule.timezone ||
            DEFAULT_TIMEZONE}
        </p>
      </div>

      <span
        className="
          text-xs
          text-[var(--theme-text-subtle)]
        "
      >
        Administrar →
      </span>
    </button>
  );
}

/* ============================================
   EXCEPTIONS
============================================ */

function ExceptionsList({
  exceptions,
  onEdit,
}) {
  if (
    exceptions.length === 0
  ) {
    return (
      <EmptyState
        title="Sin excepciones"
        description="No existen bloqueos ni aperturas adicionales configuradas."
      />
    );
  }

  return (
    <div
      className="
        grid
        gap-4
        xl:grid-cols-2
      "
    >
      {exceptions.map(
        (exception) => (
          <ExceptionCard
            key={
              exception.id
            }
            exception={
              exception
            }
            onEdit={() =>
              onEdit(
                exception
              )
            }
          />
        )
      )}
    </div>
  );
}

function ExceptionCard({
  exception,
  onEdit,
}) {
  const isBlocked =
    exception.exception_type ===
    "BLOCKED";

  const fullDay =
    !exception.start_time &&
    !exception.end_time;

  return (
    <article
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-6
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-5
        "
      >
        <div>
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <ExceptionTypeBadge
              blocked={
                isBlocked
              }
            />

            <StatusBadge
              active={
                exception.is_active
              }
            />

            {exception.repeats_yearly && (
              <SimpleBadge>
                Anual
              </SimpleBadge>
            )}
          </div>

          <h2
            className="
              mt-4
              text-lg
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {formatDate(
              exception.exception_date
            )}
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-[var(--theme-text-muted)]
            "
          >
            {fullDay
              ? "Día completo"
              : `${formatTime(
                  exception.start_time
                )} — ${formatTime(
                  exception.end_time
                )}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="
            shrink-0
            rounded-xl
            border
            border-[var(--theme-border)]
            px-4
            py-2.5
            text-xs
            font-medium
            text-[var(--theme-text-secondary)]
            transition
            hover:border-[var(--theme-border-strong)]
            hover:bg-[var(--theme-accent-soft)]
            hover:text-[var(--theme-text-primary)]
          "
        >
          Administrar
        </button>
      </div>

      <p
        className="
          mt-5
          min-h-[24px]
          text-sm
          leading-6
          text-[var(--theme-text-muted)]
        "
      >
        {exception.reason ||
          (
            isBlocked
              ? "Horario no disponible."
              : "Disponibilidad adicional."
          )}
      </p>

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
          border-t
          border-[var(--theme-border)]
          pt-5
        "
      >
        <CardMeta
          label="Intervalo"
          value={`${Number(
            exception.slot_interval_minutes
          ) || 30} min`}
        />

        <CardMeta
          label="Zona horaria"
          value={
            exception.timezone ||
            DEFAULT_TIMEZONE
          }
        />
      </div>
    </article>
  );
}

/* ============================================
   RULE MODAL
============================================ */

function RuleModal({
  mode,
  item,
  onClose,
  onSaved,
}) {
  const editing =
    mode === "edit" &&
    Boolean(item?.id);

  const [form, setForm] =
    useState(
      editing
        ? ruleToForm(item)
        : {
            ...EMPTY_RULE,
            ...(item || {}),
          }
    );

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useModalBehavior(
    onClose,
    confirmDelete
  );

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validation =
        validateRule(form);

      if (validation) {
        setError(validation);
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildRulePayload(
            form
          );

        if (editing) {
          await updateAvailabilityRule(
            item.id,
            payload
          );
        } else {
          await createAvailabilityRule(
            payload
          );
        }

        await onSaved();
      } catch (error) {
        console.error(
          "Error guardando bloque:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar el bloque horario."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async () => {
      try {
        setDeleting(true);

        await deleteAvailabilityRule(
          item.id
        );

        await onSaved();
      } catch (error) {
        console.error(
          "Error eliminando bloque:",
          error
        );

        setConfirmDelete(
          false
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar el bloque."
        );
      } finally {
        setDeleting(false);
      }
    };

  return (
    <BaseModal
      title={
        editing
          ? "Editar bloque semanal"
          : "Nuevo bloque semanal"
      }
      eyebrow="Disponibilidad semanal"
      onClose={onClose}
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="p-6 sm:p-8"
      >
        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <SelectField
            label="Día"
            name="day_of_week"
            value={
              form.day_of_week
            }
            onChange={
              handleChange
            }
          >
            {DAYS.map((day) => (
              <option
                key={day.value}
                value={day.value}
              >
                {day.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Intervalo de slots"
            name="slot_interval_minutes"
            value={
              form.slot_interval_minutes
            }
            onChange={
              handleChange
            }
          >
            {SLOT_INTERVALS.map(
              (minutes) => (
                <option
                  key={minutes}
                  value={minutes}
                >
                  {minutes} minutos
                </option>
              )
            )}
          </SelectField>
        </div>

        <div
          className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <TimeField
            label="Hora inicio"
            name="start_time"
            value={
              form.start_time
            }
            onChange={
              handleChange
            }
          />

          <TimeField
            label="Hora término"
            name="end_time"
            value={form.end_time}
            onChange={
              handleChange
            }
          />
        </div>

        <div className="mt-4">
          <TextField
            label="Zona horaria"
            name="timezone"
            value={form.timezone}
            onChange={
              handleChange
            }
          />
        </div>

        <div
          className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <DateField
            label="Vigente desde"
            name="effective_from"
            value={
              form.effective_from
            }
            onChange={
              handleChange
            }
          />

          <DateField
            label="Vigente hasta"
            name="effective_to"
            value={
              form.effective_to
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div className="mt-4">
          <ToggleCard
            name="is_active"
            checked={
              form.is_active
            }
            onChange={
              handleChange
            }
            title="Bloque activo"
            description="Solo los bloques activos participan en el cálculo de horarios disponibles."
          />
        </div>

        <PreviewBox>
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-[var(--theme-text-subtle)]
            "
          >
            Vista previa
          </p>

          <p
            className="
              mt-3
              text-lg
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {getDayLabel(
              form.day_of_week
            )}
          </p>

          <p
            className="
              mt-1
              text-sm
              text-[var(--theme-text-secondary)]
            "
          >
            {form.start_time} —{" "}
            {form.end_time}
          </p>

          <p
            className="
              mt-3
              text-xs
              text-[var(--theme-text-subtle)]
            "
          >
            Slots cada{" "}
            {form.slot_interval_minutes}{" "}
            minutos ·{" "}
            {form.timezone}
          </p>
        </PreviewBox>

        {error && (
          <ErrorBox>
            {error}
          </ErrorBox>
        )}

        <button
          type="submit"
          disabled={saving}
          className="
            mt-6
            w-full
            rounded-xl
            bg-[var(--theme-accent)]
            px-5
            py-3.5
            text-sm
            font-semibold
            text-[var(--theme-bg-page)]
            transition
            hover:bg-[var(--theme-accent-hover)]
            disabled:opacity-40
          "
        >
          {saving
            ? "Guardando..."
            : editing
            ? "Guardar cambios"
            : "Crear bloque"}
        </button>

        {editing && (
          <DangerZone
            title="Eliminar bloque"
            description="El bloque dejará de participar en la disponibilidad semanal."
            onDelete={() =>
              setConfirmDelete(
                true
              )
            }
          />
        )}
      </form>

      {confirmDelete && (
        <ConfirmDelete
          title="¿Eliminar bloque?"
          description={`${getDayLabel(
            form.day_of_week
          )}, ${
            form.start_time
          } — ${form.end_time}`}
          loading={deleting}
          onCancel={() =>
            setConfirmDelete(
              false
            )
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </BaseModal>
  );
}

/* ============================================
   EXCEPTION MODAL
============================================ */

function ExceptionModal({
  mode,
  item,
  onClose,
  onSaved,
}) {
  const editing =
    mode === "edit" &&
    Boolean(item?.id);

  const [form, setForm] =
    useState(
      editing
        ? exceptionToForm(
            item
          )
        : {
            ...EMPTY_EXCEPTION,
          }
    );

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useModalBehavior(
    onClose,
    confirmDelete
  );

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");

    setForm((current) => {
      const next = {
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (
        name === "full_day" &&
        checked
      ) {
        next.start_time = "";
        next.end_time = "";
      }

      if (
        name ===
          "exception_type" &&
        value === "AVAILABLE"
      ) {
        next.full_day = false;

        if (
          !next.start_time
        ) {
          next.start_time =
            "09:00";
        }

        if (!next.end_time) {
          next.end_time =
            "18:00";
        }
      }

      return next;
    });
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validation =
        validateException(form);

      if (validation) {
        setError(validation);
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildExceptionPayload(
            form
          );

        if (editing) {
          await updateAvailabilityException(
            item.id,
            payload
          );
        } else {
          await createAvailabilityException(
            payload
          );
        }

        await onSaved();
      } catch (error) {
        console.error(
          "Error guardando excepción:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar la excepción."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async () => {
      try {
        setDeleting(true);

        await deleteAvailabilityException(
          item.id
        );

        await onSaved();
      } catch (error) {
        console.error(
          "Error eliminando excepción:",
          error
        );

        setConfirmDelete(
          false
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar la excepción."
        );
      } finally {
        setDeleting(false);
      }
    };

  const isBlocked =
    form.exception_type ===
    "BLOCKED";

  return (
    <BaseModal
      title={
        editing
          ? "Editar excepción"
          : "Nueva excepción"
      }
      eyebrow="Disponibilidad especial"
      onClose={onClose}
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="p-6 sm:p-8"
      >
        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <DateField
            label="Fecha"
            name="exception_date"
            value={
              form.exception_date
            }
            onChange={
              handleChange
            }
            required
          />

          <SelectField
            label="Tipo"
            name="exception_type"
            value={
              form.exception_type
            }
            onChange={
              handleChange
            }
          >
            <option value="BLOCKED">
              Bloqueado
            </option>

            <option value="AVAILABLE">
              Disponible adicional
            </option>
          </SelectField>
        </div>

        {isBlocked && (
          <div className="mt-4">
            <ToggleCard
              name="full_day"
              checked={
                form.full_day
              }
              onChange={
                handleChange
              }
              title="Bloquear día completo"
              description="Sin horas de inicio y término, la fecha completa queda fuera de disponibilidad."
            />
          </div>
        )}

        {!form.full_day && (
          <div
            className="
              mt-4
              grid
              gap-4
              sm:grid-cols-2
            "
          >
            <TimeField
              label="Hora inicio"
              name="start_time"
              value={
                form.start_time
              }
              onChange={
                handleChange
              }
            />

            <TimeField
              label="Hora término"
              name="end_time"
              value={
                form.end_time
              }
              onChange={
                handleChange
              }
            />
          </div>
        )}

        <div
          className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <SelectField
            label="Intervalo de slots"
            name="slot_interval_minutes"
            value={
              form.slot_interval_minutes
            }
            onChange={
              handleChange
            }
          >
            {SLOT_INTERVALS.map(
              (minutes) => (
                <option
                  key={minutes}
                  value={minutes}
                >
                  {minutes} minutos
                </option>
              )
            )}
          </SelectField>

          <TextField
            label="Zona horaria"
            name="timezone"
            value={form.timezone}
            onChange={
              handleChange
            }
          />
        </div>

        <div className="mt-4">
          <TextField
            label="Motivo"
            name="reason"
            value={form.reason}
            onChange={
              handleChange
            }
            placeholder="Feriado, reunión, horario especial..."
          />
        </div>

        <div
          className="
            mt-4
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          <ToggleCard
            name="repeats_yearly"
            checked={
              form.repeats_yearly
            }
            onChange={
              handleChange
            }
            title="Repetir anualmente"
            description="La excepción se aplicará cada año en el mismo día y mes."
          />

          <ToggleCard
            name="is_active"
            checked={
              form.is_active
            }
            onChange={
              handleChange
            }
            title="Excepción activa"
            description="Solo las excepciones activas participan en el motor de disponibilidad."
          />
        </div>

        <PreviewBox>
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <ExceptionTypeBadge
              blocked={
                isBlocked
              }
            />

            {form.repeats_yearly && (
              <SimpleBadge>
                Anual
              </SimpleBadge>
            )}
          </div>

          <p
            className="
              mt-4
              text-lg
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {form.exception_date
              ? formatDate(
                  form.exception_date
                )
              : "Selecciona una fecha"}
          </p>

          <p
            className="
              mt-1
              text-sm
              text-[var(--theme-text-secondary)]
            "
          >
            {form.full_day
              ? "Día completo"
              : `${form.start_time ||
                  "—"} — ${
                  form.end_time ||
                  "—"
                }`}
          </p>

          {form.reason && (
            <p
              className="
                mt-4
                text-xs
                leading-6
                text-[var(--theme-text-subtle)]
              "
            >
              {form.reason}
            </p>
          )}
        </PreviewBox>

        {error && (
          <ErrorBox>
            {error}
          </ErrorBox>
        )}

        <button
          type="submit"
          disabled={saving}
          className="
            mt-6
            w-full
            rounded-xl
            bg-[var(--theme-accent)]
            px-5
            py-3.5
            text-sm
            font-semibold
            text-[var(--theme-bg-page)]
            transition
            hover:bg-[var(--theme-accent-hover)]
            disabled:opacity-40
          "
        >
          {saving
            ? "Guardando..."
            : editing
            ? "Guardar cambios"
            : "Crear excepción"}
        </button>

        {editing && (
          <DangerZone
            title="Eliminar excepción"
            description="La fecha dejará de modificar la disponibilidad habitual."
            onDelete={() =>
              setConfirmDelete(
                true
              )
            }
          />
        )}
      </form>

      {confirmDelete && (
        <ConfirmDelete
          title="¿Eliminar excepción?"
          description={
            form.exception_date
              ? formatDate(
                  form.exception_date
                )
              : "Excepción"
          }
          loading={deleting}
          onCancel={() =>
            setConfirmDelete(
              false
            )
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </BaseModal>
  );
}

/* ============================================
   MODAL BASE
============================================ */

function BaseModal({
  title,
  eyebrow,
  onClose,
  children,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          max-h-[94vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-[1.75rem]
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-elevated)]
          shadow-2xl
        "
      >
        <div
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            border-b
            border-[var(--theme-border)]
            bg-[var(--theme-bg-elevated)]/95
            px-6
            py-5
            backdrop-blur
            sm:px-8
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-[var(--theme-text-muted)]
              "
            >
              {eyebrow}
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-semibold
                tracking-[-0.025em]
                text-[var(--theme-text-primary)]
              "
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--theme-border)]
              text-[var(--theme-text-secondary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:text-[var(--theme-text-primary)]
            "
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ============================================
   UI COMPONENTS
============================================ */

function TabButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        border-b-2
        px-4
        py-4
        text-sm
        font-medium
        transition

        ${
          active
            ? "border-[var(--theme-accent)] text-[var(--theme-text-primary)]"
            : "border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
        }
      `}
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-5
      "
    >
      <p
        className="
          text-xs
          text-[var(--theme-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-semibold
          tracking-[-0.035em]
          text-[var(--theme-text-primary)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function CardMeta({
  label,
  value,
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          uppercase
          tracking-[0.12em]
          text-[var(--theme-text-subtle)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          text-xs
          text-[var(--theme-text-secondary)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={`availability-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`availability-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          placeholder:text-[var(--theme-text-subtle)]
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={`availability-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <select
        id={`availability-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          focus:border-[var(--theme-accent)]/25
        "
      >
        {children}
      </select>
    </div>
  );
}

function TimeField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={`availability-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`availability-${name}`}
        type="time"
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

function DateField({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={`availability-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`availability-${name}`}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

function ToggleCard({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-start
        gap-3
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-4
      "
    >
      <input
        type="checkbox"
        name={name}
        checked={
          Boolean(checked)
        }
        onChange={onChange}
        className="
          mt-1
          h-4
          w-4
          accent-[var(--theme-accent)]
        "
      />

      <div>
        <p
          className="
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[var(--theme-text-muted)]
          "
        >
          {description}
        </p>
      </div>
    </label>
  );
}

function PreviewBox({
  children,
}) {
  return (
    <div
      className="
        mt-6
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-5
      "
    >
      {children}
    </div>
  );
}

function ErrorBox({
  children,
}) {
  return (
    <div
      className="
        mt-5
        rounded-xl
        border
        border-[var(--theme-danger)]
        bg-[var(--theme-danger-soft)]
        px-4
        py-3
        text-sm
        text-[var(--theme-danger)]
      "
    >
      {children}
    </div>
  );
}

function StatusBadge({
  active,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]

        ${
          active
            ? "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
            : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            active
              ? "bg-[var(--theme-success)]"
              : "bg-[var(--theme-text-muted)]"
          }
        `}
      />

      {active
        ? "Activo"
        : "Inactivo"}
    </span>
  );
}

function ExceptionTypeBadge({
  blocked,
}) {
  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]

        ${
          blocked
            ? "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]"
            : "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
        }
      `}
    >
      {blocked
        ? "Bloqueado"
        : "Disponible"}
    </span>
  );
}

function SimpleBadge({
  children,
}) {
  return (
    <span
      className="
        inline-flex
        rounded-full
        border
        border-[var(--theme-border)]
        bg-[var(--theme-border)]
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--theme-text-secondary)]
      "
    >
      {children}
    </span>
  );
}

function DangerZone({
  title,
  description,
  onDelete,
}) {
  return (
    <div
      className="
        mt-8
        border-t
        border-[var(--theme-border)]
        pt-8
      "
    >
      <p
        className="
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {title}
      </p>

      <p
        className="
          mt-2
          text-xs
          leading-5
          text-[var(--theme-text-subtle)]
        "
      >
        {description}
      </p>

      <button
        type="button"
        onClick={onDelete}
        className="
          mt-4
          rounded-xl
          border
          border-[var(--theme-danger)]
          px-4
          py-2.5
          text-xs
          font-semibold
          text-[var(--theme-danger)]
          transition
          hover:bg-[var(--theme-danger-soft)]
        "
      >
        Eliminar
      </button>
    </div>
  );
}

function ConfirmDelete({
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="
        absolute
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/90
        p-5
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-card)]
          p-6
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--theme-danger)]
            bg-[var(--theme-danger-soft)]
            text-[var(--theme-danger)]
          "
        >
          !
        </div>

        <h3
          className="
            mt-6
            text-xl
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[var(--theme-text-secondary)]
          "
        >
          {description}
        </p>

        <div
          className="
            mt-7
            flex
            gap-3
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              border
              border-[var(--theme-border)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-secondary)]
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              bg-[var(--theme-danger)]
              px-4
              py-3
              text-sm
              font-semibold
              text-[var(--theme-text-primary)]
              disabled:opacity-40
            "
          >
            {loading
              ? "Eliminando..."
              : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        px-6
        py-20
        text-center
      "
    >
      <p
        className="
          text-sm
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {title}
      </p>

      <p
        className="
          mt-2
          text-xs
          text-[var(--theme-text-subtle)]
        "
      >
        {description}
      </p>
    </div>
  );
}

function AvailabilitySkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        xl:grid-cols-2
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              h-48
              animate-pulse
              rounded-2xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-card)]
            "
          />
        )
      )}
    </div>
  );
}

/* ============================================
   VALIDATION / PAYLOADS
============================================ */

function validateRule(form) {
  const day =
    Number(form.day_of_week);

  if (
    !Number.isInteger(day) ||
    day < 1 ||
    day > 7
  ) {
    return "El día seleccionado no es válido.";
  }

  if (
    !form.start_time ||
    !form.end_time
  ) {
    return "Debes indicar hora de inicio y término.";
  }

  if (
    form.end_time <=
    form.start_time
  ) {
    return "La hora de término debe ser posterior a la hora de inicio.";
  }

  if (
    !SLOT_INTERVALS.includes(
      Number(
        form.slot_interval_minutes
      )
    )
  ) {
    return "El intervalo debe ser 15, 30 o 60 minutos.";
  }

  if (
    form.effective_from &&
    form.effective_to &&
    form.effective_to <
      form.effective_from
  ) {
    return "La fecha de término de vigencia no puede ser anterior al inicio.";
  }

  return null;
}

function validateException(
  form
) {
  if (!form.exception_date) {
    return "La fecha es obligatoria.";
  }

  if (
    ![
      "BLOCKED",
      "AVAILABLE",
    ].includes(
      form.exception_type
    )
  ) {
    return "El tipo de excepción no es válido.";
  }

  if (
    form.exception_type ===
      "AVAILABLE" &&
    form.full_day
  ) {
    return "Una apertura adicional debe tener horario de inicio y término.";
  }

  if (!form.full_day) {
    if (
      !form.start_time ||
      !form.end_time
    ) {
      return "Debes indicar hora de inicio y término.";
    }

    if (
      form.end_time <=
      form.start_time
    ) {
      return "La hora de término debe ser posterior a la hora de inicio.";
    }
  }

  if (
    !SLOT_INTERVALS.includes(
      Number(
        form.slot_interval_minutes
      )
    )
  ) {
    return "El intervalo debe ser 15, 30 o 60 minutos.";
  }

  return null;
}

function buildRulePayload(
  form
) {
  return {
    day_of_week:
      Number(
        form.day_of_week
      ),

    start_time:
      normalizeTime(
        form.start_time
      ),

    end_time:
      normalizeTime(
        form.end_time
      ),

    timezone:
      (
        form.timezone ||
        DEFAULT_TIMEZONE
      ).trim(),

    slot_interval_minutes:
      Number(
        form.slot_interval_minutes
      ),

    effective_from:
      nullable(
        form.effective_from
      ),

    effective_to:
      nullable(
        form.effective_to
      ),

    is_active:
      Boolean(
        form.is_active
      ),
  };
}

function buildExceptionPayload(
  form
) {
  const fullDay =
    form.exception_type ===
      "BLOCKED" &&
    Boolean(form.full_day);

  return {
    exception_date:
      form.exception_date,

    exception_type:
      form.exception_type,

    start_time:
      fullDay
        ? null
        : normalizeTime(
            form.start_time
          ),

    end_time:
      fullDay
        ? null
        : normalizeTime(
            form.end_time
          ),

    timezone:
      (
        form.timezone ||
        DEFAULT_TIMEZONE
      ).trim(),

    slot_interval_minutes:
      Number(
        form.slot_interval_minutes
      ),

    reason:
      nullable(form.reason),

    repeats_yearly:
      Boolean(
        form.repeats_yearly
      ),

    is_active:
      Boolean(
        form.is_active
      ),
  };
}

/* ============================================
   DATA MAPPING
============================================ */

function ruleToForm(rule) {
  return {
    day_of_week:
      Number(
        rule.day_of_week
      ),

    start_time:
      normalizeTime(
        rule.start_time
      ),

    end_time:
      normalizeTime(
        rule.end_time
      ),

    timezone:
      rule.timezone ||
      DEFAULT_TIMEZONE,

    slot_interval_minutes:
      Number(
        rule.slot_interval_minutes
      ) || 30,

    effective_from:
      normalizeDate(
        rule.effective_from
      ),

    effective_to:
      normalizeDate(
        rule.effective_to
      ),

    is_active:
      Boolean(rule.is_active),
  };
}

function exceptionToForm(
  exception
) {
  const fullDay =
    !exception.start_time &&
    !exception.end_time;

  return {
    exception_date:
      normalizeDate(
        exception.exception_date
      ),

    exception_type:
      exception.exception_type ||
      "BLOCKED",

    full_day: fullDay,

    start_time:
      normalizeTime(
        exception.start_time
      ),

    end_time:
      normalizeTime(
        exception.end_time
      ),

    timezone:
      exception.timezone ||
      DEFAULT_TIMEZONE,

    slot_interval_minutes:
      Number(
        exception.slot_interval_minutes
      ) || 30,

    reason:
      exception.reason || "",

    repeats_yearly:
      Boolean(
        exception.repeats_yearly
      ),

    is_active:
      Boolean(
        exception.is_active
      ),
  };
}

/* ============================================
   HELPERS
============================================ */

function extractCollection(
  data,
  keys
) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (
      Array.isArray(
        data?.[key]
      )
    ) {
      return data[key];
    }
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data;
  }

  return [];
}

function useModalBehavior(
  onClose,
  locked
) {
  useEffect(() => {
    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handler = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !locked
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handler
    );

    return () => {
      document.body.style.overflow =
        previous;

      document.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [onClose, locked]);
}

function getDayLabel(value) {
  return (
    DAYS.find(
      (day) =>
        day.value ===
        Number(value)
    )?.label || "Día"
  );
}

function normalizeTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    5
  );
}

function normalizeDate(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    10
  );
}

function nullable(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized || null;
}

function formatTime(value) {
  const time =
    normalizeTime(value);

  return time || "—";
}

function formatDate(value) {
  const normalized =
    normalizeDate(value);

  if (!normalized) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] = normalized
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

export default AvailabilityAdminPage;
