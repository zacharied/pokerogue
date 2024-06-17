import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import Phaser from "phaser";
import GameManager from "#app/test/utils/gameManager";
import * as overrides from "#app/overrides";
import
{
  CommandPhase
} from "#app/phases";
import { Stat } from "#app/data/pokemon-stat";
import { getMovePosition } from "#app/test/utils/gameManagerUtils";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { allMoves } from "#app/data/move.js";

const MOVE_TO_USE = Moves.ROLLOUT;

describe("Moves - Rollout", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

  const doAttack = (move: Moves = MOVE_TO_USE) => game.doAttack(getMovePosition(game.scene, 0, move));

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
    vi.spyOn(overrides, "STARTER_SPECIES_OVERRIDE", "get").mockReturnValue(Species.RATTATA);
    vi.spyOn(overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.NONE);
    vi.spyOn(overrides, "OPP_SPECIES_OVERRIDE", "get").mockReturnValue(Species.BIDOOF);
    vi.spyOn(overrides, "OPP_ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.NONE);
    vi.spyOn(overrides, "STARTING_LEVEL_OVERRIDE", "get").mockReturnValue(10);
    vi.spyOn(overrides, "OPP_LEVEL_OVERRIDE", "get").mockReturnValue(10);
    vi.spyOn(overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([MOVE_TO_USE]);
    vi.spyOn(overrides, "OPP_MOVESET_OVERRIDE", "get").mockReturnValue([Moves.SPLASH,Moves.SPLASH,Moves.SPLASH,Moves.SPLASH]);
  });

  it("roughly doubles damage each consecutive use", async() => {
    allMoves[MOVE_TO_USE].accuracy = 100;
    const damageHistory: number[] = [];
    const variance = 5;

    await game.startBattle();

    const enemy = game.scene.getEnemyParty()[0];

    enemy.stats[Stat.HP] = 1000;
    enemy.hp = enemy.getMaxHp();
    let turnStartHp = enemy.hp;

    doAttack();
    await game.phaseInterceptor.to(CommandPhase);

    damageHistory.push(turnStartHp - enemy.hp);
    turnStartHp = enemy.hp;

    doAttack();
    await game.phaseInterceptor.to(CommandPhase);

    damageHistory.push(turnStartHp - enemy.hp);
    turnStartHp = enemy.hp;

    doAttack();
    await game.phaseInterceptor.to(CommandPhase);

    damageHistory.push(turnStartHp - enemy.hp);

    console.log(damageHistory);

    expect(damageHistory[1]).toBeGreaterThanOrEqual(damageHistory[0] * 2 - variance);
    expect(damageHistory[1]).toBeLessThanOrEqual(damageHistory[0] * 2 + variance);

    expect(damageHistory[2]).toBeGreaterThanOrEqual(damageHistory[1] * 2 - variance);
    expect(damageHistory[2]).toBeLessThanOrEqual(damageHistory[1] * 2 + variance);
  }, 20000);
}
);
