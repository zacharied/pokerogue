import { afterEach, beforeAll, beforeEach, describe, it, vi } from "vitest";
import Phaser from "phaser";
import GameManager from "#app/test/utils/gameManager";
import * as overrides from "#app/overrides";
import
{
  TurnInitPhase
} from "#app/phases";
import { getMovePosition } from "#app/test/utils/gameManagerUtils";
import { Stat } from "#app/data/pokemon-stat";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { Abilities } from "#app/enums/abilities.js";

const MOVE = Moves.CORE_ENFORCER;

describe("Moves - Core Enforcer", () => {
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
    vi.spyOn(overrides, "NEVER_CRIT_OVERRIDE", "get").mockReturnValue(true);
    vi.spyOn(overrides, "SINGLE_BATTLE_OVERRIDE", "get").mockReturnValue(true);
    vi.spyOn(overrides, "OPP_SPECIES_OVERRIDE", "get").mockReturnValue(Species.MAGIKARP);
    vi.spyOn(overrides, "STARTING_LEVEL_OVERRIDE", "get").mockReturnValue(100);
    vi.spyOn(overrides, "STARTING_WAVE_OVERRIDE", "get").mockReturnValue(1);
    vi.spyOn(overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([MOVE]);
    vi.spyOn(overrides, "OPP_MOVESET_OVERRIDE", "get").mockReturnValue([Moves.SPLASH,Moves.SPLASH,Moves.SPLASH,Moves.SPLASH]);
  });

  it("suppresses Sturdy", async () => {
    vi.spyOn(overrides, "OPP_ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.STURDY);

    await game.startBattle();

    game.scene.getParty()[0].stats[Stat.SPD] = 1;
    game.scene.getEnemyParty()[0].stats[Stat.SPD] = 2;

    game.doAttack(getMovePosition(game.scene, 0, MOVE));

    await game.phaseInterceptor.to(TurnInitPhase);
  });
});
