"use client";

import { Button } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
  deleteExtension,
  type Extension,
  getExtensions,
  type ExtensionStatus,
  updateExtensionStatus,
} from "@/lib/extensions-api";
import {
  type ExtensionFilter,
  usePreferencesStore,
} from "@/lib/preferences";

const extensionLogos = [
  "logo-devlens.svg",
  "logo-style-spy.svg",
  "logo-speed-boost.svg",
  "logo-json-wizard.svg",
  "logo-tab-master-pro.svg",
  "logo-viewport-buddy.svg",
  "logo-markup-notes.svg",
  "logo-grid-guides.svg",
  "logo-palette-picker.svg",
  "logo-link-checker.svg",
  "logo-dom-snapshot.svg",
  "logo-console-plus.svg",
];

const filters: { label: string; value: ExtensionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function logoFor(extension: Extension, index: number): string {
  const name = extension.name.toLowerCase();
  const keywordMatches: [string, string][] = [
    ["dark", "logo-style-spy.svg"],
    ["payment", "logo-palette-picker.svg"],
    ["email", "logo-link-checker.svg"],
    ["file", "logo-json-wizard.svg"],
    ["language", "logo-markup-notes.svg"],
    ["analytics", "logo-console-plus.svg"],
    ["chat", "logo-tab-master-pro.svg"],
    ["push", "logo-speed-boost.svg"],
    ["social", "logo-grid-guides.svg"],
    ["roles", "logo-devlens.svg"],
    ["seo", "logo-viewport-buddy.svg"],
  ];
  const match = keywordMatches.find(([keyword]) => name.includes(keyword));
  return `/images/${match?.[1] ?? extensionLogos[index % extensionLogos.length]}`;
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {dark ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
      ) : (
        <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
      )}
    </svg>
  );
}

function ExtensionCard({
  extension,
  index,
  onToggle,
  onRemove,
  isSaving,
  isRemoving,
}: {
  extension: Extension;
  index: number;
  onToggle: (extension: Extension, status: ExtensionStatus) => void;
  onRemove: (extension: Extension) => void;
  isSaving: boolean;
  isRemoving: boolean;
}) {
  return (
    <article className="flex min-h-[200px] flex-col justify-between rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_2px_6px_rgba(9,21,64,0.05)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] hover:shadow-[0_8px_22px_rgba(9,21,64,0.10)] sm:min-h-[190px]">
      <div className="flex items-start gap-4">
        <Image
          alt=""
          className="h-[60px] w-[60px] shrink-0 rounded-[14px]"
          height={60}
          src={logoFor(extension, index)}
          width={60}
        />
        <div className="min-w-0 pt-0.5">
          <h2 className="break-words text-base font-bold leading-6 text-[var(--text-primary)]">
            {extension.name}
          </h2>
          <p className="mt-1.5 text-sm leading-[1.45rem] text-[var(--text-secondary)]">
            {extension.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button
          aria-label={`Remove ${extension.name}`}
          className="h-9 min-w-0 border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
          isDisabled={isRemoving}
          onPress={() => onRemove(extension)}
          radius="full"
          size="sm"
          variant="bordered"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
        <button
          aria-checked={extension.status === "active"}
          aria-label={`${extension.status === "active" ? "Deactivate" : "Activate"} ${extension.name}`}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            extension.status === "active" ? "bg-[var(--accent)]" : "bg-[#c7c7c7]"
          }`}
          disabled={isSaving}
          onClick={() =>
            onToggle(
              extension,
              extension.status === "active" ? "inactive" : "active",
            )
          }
          role="switch"
          type="button"
        >
          <span
            className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
              extension.status === "active" ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </article>
  );
}

export function ExtensionsDashboard() {
  const queryClient = useQueryClient();
  const filter = usePreferencesStore((state) => state.filter);
  const theme = usePreferencesStore((state) => state.theme);
  const setFilter = usePreferencesStore((state) => state.setFilter);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);

  useEffect(() => {
    void usePreferencesStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const extensionsQuery = useQuery({
    queryKey: ["extensions"],
    queryFn: getExtensions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ExtensionStatus }) =>
      updateExtensionStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["extensions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExtension(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["extensions"] }),
  });

  const extensions = extensionsQuery.data ?? [];
  const filteredExtensions =
    filter === "all"
      ? extensions
      : extensions.filter((extension) => extension.status === filter);
  const activeCount = extensions.filter(
    (extension) => extension.status === "active",
  ).length;
  const actionError = updateMutation.error ?? deleteMutation.error;

  function handleToggle(extension: Extension, status: ExtensionStatus) {
    updateMutation.mutate({ id: extension.id, status });
  }

  function handleRemove(extension: Extension) {
    deleteMutation.mutate(extension.id);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1240px] px-4 pb-12 pt-5 sm:px-6 sm:pt-6 lg:px-8">
      <header className="flex h-[68px] items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 shadow-[0_2px_8px_rgba(9,21,64,0.08)] sm:px-5">
        <Link
          aria-label="Extensions home"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          href="/"
        >
          <span
            aria-hidden="true"
            className="relative h-10 w-10 shrink-0 overflow-hidden"
          >
            <Image
              alt=""
              className="absolute left-0 top-0 max-w-none"
              height={41}
              src="/images/logo.svg"
              width={179}
            />
          </span>
          <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
            Extensions
          </span>
        </Link>
        <Button
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          className="h-10 min-w-10 rounded-xl bg-[var(--control-background)] p-0 text-[var(--control-foreground)] hover:bg-[var(--border)]"
          isIconOnly
          onPress={toggleTheme}
          variant="flat"
        >
          <ThemeIcon dark={theme === "dark"} />
        </Button>
      </header>

      <section className="mt-8 sm:mt-9" aria-labelledby="extensions-heading">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-baseline gap-3">
            <h1
              className="text-[1.75rem] font-bold leading-tight tracking-[-0.04em] text-[var(--text-primary)]"
              id="extensions-heading"
            >
              Extensions List
            </h1>
            {!extensionsQuery.isPending && !extensionsQuery.isError && (
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {activeCount} active
              </span>
            )}
          </div>
          <div
            aria-label="Filter extensions"
            className="flex items-center gap-2"
            role="group"
          >
            {filters.map((option) => (
              <Button
                aria-pressed={filter === option.value}
                className={`h-10 min-w-0 px-4 text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
                key={option.value}
                onPress={() => setFilter(option.value)}
                radius="full"
                variant="flat"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {actionError && (
          <div
            className="mt-5 rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-[var(--text-primary)]"
            role="alert"
          >
            Could not update the extension: {actionError.message}
          </div>
        )}

        {extensionsQuery.isPending ? (
          <div
            aria-label="Loading extensions"
            className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
            role="status"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="h-[190px] animate-pulse rounded-[20px] border border-[var(--border)] bg-[var(--surface)]"
                key={index}
              />
            ))}
          </div>
        ) : extensionsQuery.isError ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
            <p className="font-semibold text-[var(--text-primary)]">
              We couldn&apos;t load your extensions.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {extensionsQuery.error.message}
            </p>
            <Button
              className="mt-5 bg-[var(--accent)] text-white"
              onPress={() => void extensionsQuery.refetch()}
              radius="full"
            >
              Try again
            </Button>
          </div>
        ) : filteredExtensions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
            <p className="font-semibold text-[var(--text-primary)]">
              {extensions.length === 0
                ? "No extensions yet"
                : `No ${filter} extensions`}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {extensions.length === 0
                ? "Extensions you add will show up here."
                : "Try another filter to see more extensions."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {filteredExtensions.map((extension) => {
              const index = extensions.findIndex(
                (item) => item.id === extension.id,
              );
              return (
                <ExtensionCard
                  extension={extension}
                  index={index}
                  isRemoving={
                    deleteMutation.isPending &&
                    deleteMutation.variables === extension.id
                  }
                  isSaving={
                    updateMutation.isPending &&
                    updateMutation.variables?.id === extension.id
                  }
                  key={extension.id}
                  onRemove={handleRemove}
                  onToggle={handleToggle}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
