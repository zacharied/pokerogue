import { Stat } from "#app/data/pokemon-stat.js";
import * as overrides from "#app/overrides";
import { MoveEffectPhase, MovePhase } from "#app/phases.js";
import GameManager from "#app/test/utils/gameManager";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import Phaser from "phaser";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getMovePosition } from "../utils/gameManagerUtils";

const MOVE_TO_USE = Moves.PRESENT;

describe("Moves - Present", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    vi.spyOn(overrides, "SINGLE_BATTLE_OVERRIDE", "get").mockReturnValue(true);
    vi.spyOn(overrides, "NEVER_CRIT_OVERRIDE", "get").mockReturnValue(true);
  });

  it("respects turn order when doing healing effect", async () => {
    vi.spyOn(overrides, "STARTER_SPECIES_OVERRIDE", "get").mockReturnValue(Species.DELIBIRD);
    vi.spyOn(overrides, "OPP_SPECIES_OVERRIDE", "get").mockReturnValue(Species.RATTATA);
    vi.spyOn(overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([MOVE_TO_USE]);
    vi.spyOn(overrides, "OPP_MOVESET_OVERRIDE", "get").mockReturnValue([Moves.SPLASH,Moves.SPLASH,Moves.SPLASH,Moves.SPLASH]);

    await game.startBattle();

    game.scene.getParty()[0].stats[Stat.SPD] = 1;
    game.scene.currentBattle.enemyParty[0].stats[Stat.SPD] = 2;

    game.doAttack(getMovePosition(game.scene, 0, MOVE_TO_USE));

    await game.phaseInterceptor.to(MoveEffectPhase);

    expect((game.scene.getCurrentPhase() as MovePhase).pokemon).toBe(game.scene.getEnemyParty()[0]);
  });
});
