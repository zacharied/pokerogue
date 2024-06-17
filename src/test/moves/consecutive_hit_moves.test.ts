import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("Moves - Sequential Hits Over Turns Moves", () => {
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
    vi.spyOn(overrides, "STARTER_SPECIES_OVERRIDE", "get").mockReturnValue(Species.RATTATA);
    vi.spyOn(overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.NONE);
    vi.spyOn(overrides, "OPP_SPECIES_OVERRIDE", "get").mockReturnValue(Species.BIDOOF);
    vi.spyOn(overrides, "OPP_ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.NONE);
    vi.spyOn(overrides, "STARTING_LEVEL_OVERRIDE", "get").mockReturnValue(100);
    vi.spyOn(overrides, "OPP_LEVEL_OVERRIDE", "get").mockReturnValue(100);
    vi.spyOn(overrides, "OPP_MOVESET_OVERRIDE", "get").mockReturnValue([Moves.SPLASH,Moves.SPLASH,Moves.SPLASH,Moves.SPLASH]);
  });

  const outputs = [];

  const func = async(move: Moves) => {
    const doAttack = () => game.doAttack(getMovePosition(game.scene, 0, move));
    vi.spyOn(overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([move]);
    allMoves[move].accuracy = 100;

    const damageHistory: number[] = [];
    const variance = 5;

    await game.startBattle();

    const enemy = game.scene.getEnemyParty()[0];

    enemy.stats[Stat.HP] = 2000;
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
    outputs.push(damageHistory);

    expect(damageHistory[1]).toBeGreaterThanOrEqual(damageHistory[0] * 2 - variance);
    expect(damageHistory[1]).toBeLessThanOrEqual(damageHistory[0] * 2 + variance);

    expect(damageHistory[2]).toBeGreaterThanOrEqual(damageHistory[1] * 2 - variance);
    expect(damageHistory[2]).toBeLessThanOrEqual(damageHistory[1] * 2 + variance);
  };

  it("Fury Cutter", async() => func(Moves.FURY_CUTTER), { sequential: true, repeats: 50 });

  afterAll(() => {
    for (let i = 0; i < 3; i++) {
      console.log(outputs.map(o => o[i]).reduce((p, c) => p + c) / outputs.length);
    }
  });
});
