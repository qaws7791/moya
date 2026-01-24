import { For, type Component } from "solid-js";
import {
  formatGroups,
  type FormatGroup,
  type FormatOption,
} from "../core/format-options";
import type { CleanerOptions } from "../core/types";

interface FormatSelectorProps {
  options: CleanerOptions;
  onOptionsChange: (options: CleanerOptions) => void;
}

export const FormatSelector: Component<FormatSelectorProps> = (props) => {
  const handleToggle = (key: keyof CleanerOptions) => {
    props.onOptionsChange({
      ...props.options,
      [key]: !props.options[key],
    });
  };

  const setAll = (val: boolean) => {
    const newOptions: CleanerOptions = {};
    formatGroups.forEach((group) => {
      group.options.forEach((opt) => {
        newOptions[opt.key] = val;
      });
    });
    props.onOptionsChange(newOptions);
  };

  return (
    <div class="card bg-base-100 shadow-xl mb-6 border border-base-200">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="card-title text-xl font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 text-primary"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            삭제할 서식 선택
          </h2>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-neutral" onClick={() => setAll(true)}>
              전체 선택
            </button>
            <button
              class="btn btn-sm btn-outline"
              onClick={() => setAll(false)}
            >
              전체 해제
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <For each={formatGroups}>
            {(group: FormatGroup) => (
              <div class="flex flex-col gap-3">
                <h3 class="font-semibold text-lg text-base-content/70 border-b border-base-200 pb-2">
                  {group.label}
                </h3>
                <div class="flex flex-col gap-2">
                  <For each={group.options}>
                    {(option: FormatOption) => (
                      <label class="label cursor-pointer justify-start gap-3 hover:bg-base-200/50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          class="checkbox checkbox-primary checkbox-sm"
                          checked={props.options[option.key] || false}
                          onChange={() => handleToggle(option.key)}
                        />
                        <span class="label-text font-medium">
                          {option.label}
                        </span>
                      </label>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
