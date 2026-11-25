import type { Compiler, RspackPluginInstance } from "@rspack/core";
import { runExtractor, runTypesGenerator, type I18nextToolkitConfig } from "i18next-cli";
import path from "node:path";

interface Options {
  config: I18nextToolkitConfig;
  initial?: boolean;
  quiet?: boolean;
}

const PLUGIN_NAME = "I18nextExtractorPlugin";

const EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"]);

/**
 * Extract translations and regenerate types when the Rspack server detects file changes.
 */
export class I18nextExtractorPlugin implements RspackPluginInstance {
  private firstCompilation = true;

  private config: Options["config"];
  private initial: Options["initial"];
  private quiet: NonNullable<Options["quiet"]>;

  constructor({ config, initial, quiet }: Options) {
    this.config = config;
    this.initial = initial;
    this.quiet = quiet ?? false;
  }

  apply(compiler: Compiler): void {
    const run = async (currentCompiler: Compiler) => {
      const isInitialCompilation = this.firstCompilation;
      this.firstCompilation = false;

      if (isInitialCompilation && !this.initial) {
        return;
      }

      const modified: string[] = [];
      for (const file of currentCompiler.modifiedFiles ?? modified) {
        if (EXTENSIONS.has(path.extname(file))) {
          modified.push(file);
        }
      }

      const fullExtraction = Boolean(isInitialCompilation || currentCompiler.removedFiles?.size);
      const input = fullExtraction ? this.config.extract.input : modified;
      if (!input.length) return;

      const config = {
        ...this.config,
        extract: {
          ...this.config.extract,
          input,
          removeUnusedKeys: fullExtraction,
        },
      };

      const result = await runExtractor(config, {
        quiet: this.quiet,
        syncPrimaryWithDefaults: true,
      });

      if (result.hasErrors) {
        throw new Error("[i18next] extraction failed.", { cause: result.results });
      }

      if (result.anyFileUpdated || isInitialCompilation) {
        await runTypesGenerator(this.config, { quiet: this.quiet });
      }
    };

    compiler.hooks.watchRun.tapPromise({ name: PLUGIN_NAME, stage: -1000 }, run);
  }
}
