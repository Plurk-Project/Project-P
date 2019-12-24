class Plurk {
  static get bz() {
    return ["黑", "藍", "紅", "綠"];
  }
  /**
   * Get sum of N dice 20
   * @param {Number} num quantity
   * @returns {Number}
   */
  static getDice20(num = 1) {
    let sum = 0;
    for (let i = 0; i < num; i++) {
      sum += Math.floor(20 * Math.random() + 1);
    }
    return sum;
  }
  /**
   * Get num bz
   * @param {Number} num quantity
   * @returns {Array}
   */
  static getBZs(num = 3) {
    let bzs = [];
    for (let i = 0; i < num; i++) {
      bzs.push(this.bz[Math.floor(Math.random() * this.bz.length)]);
    }
    return bzs;
  }
}

class Player {
  /**
   * Player constructor
   * @param {Weapon} weapon
   * @param {Armour} armour
   * @param {Accessory} accessory
   */
  constructor(
    weapon = new Weapon(),
    armour = new Armour(),
    accessory = new Accessory()
  ) {
    this.weapon = weapon;
    this.armour = armour;
    this.accessory = accessory;
    this.initStatus();
  }

  initStatus(first = true) {
    this.attack = 0;
    this.attackRate = this.weapon.attackRate;
    this.attackBonus = this.weapon.attackRate;
    this.defenseRate = this.armour.defenseRate;
    this.defenseBonus = this.armour.defenseBonus;
    this.reflex = false;

    if (first) {
      this.hp = 100;
      this.delayToLockSkill = false;
      this.skillLocked = false;
    }
  }

  /**
   * Prepare some attributes to calculate damage.
   */
  prepare() {
    // init status
    this.initStatus(false);

    this.attack = Plurk.getDice20(1 + this.weapon.dice20BonusNum);
    this.bzs = Plurk.getBZs(3 + this.accessory.bzBonusNum);
    // check skill
    if (this.canUseSkill()) {
      this.useSkill();
    } else if (this.canUseUltraSkill()) {
      this.useUltraSkill();
    } else if (this.isSmallMistake()) {
      this.makeSmallMistake();
    } else if (this.isBigMistake()) {
      this.makeBigMistake();
    }
  }

  /**
   * Attack each other
   * @param {Player} player1
   * @param {Player} player2
   */
  static attackEachOther(player1, player2) {
    // TODO: 可以在 prepare 完後 return 使用技能的資訊在另外建一張表來計算 影響的數值
    player1.prepare();
    player2.prepare();
    let attack1 = player1.calculateAttack();
    let attack2 = player2.calculateAttack();
    if (player1.reflex && player2.reflex) {
      player1.makeDamage(attack1);
      player2.makeDamage(attack2);
    } else if (player1.reflex) {
      // TODO: 尚未確定反彈傷害是一併計算還是分開計算
      player2.makeDamage(attack1 + attack2);
    } else if (player2.reflex) {
      // TODO: 同上
      player1.makeDamage(attack1 + attack2);
    } else {
      player1.makeDamage(attack2);
      player2.makeDamage(attack1);
    }

    // check lock skill
    Player.lockSkill(player1, player2);
  }

  static lockSkill(player1, player2) {
    if (player1.delayToLockSkill) {
      player1.delayToLockSkill = false;

      player2.skillLocked = true;
    } else {
      player2.skillLocked = false;
    }
    if (player2.delayToLockSkill) {
      player2.delayToLockSkill = false;

      player1.skillLocked = true;
    } else {
      player1.skillLocked = false;
    }
  }

  getHp() {
    return this.hp;
  }

  /**
   * @returns {Number}
   */
  calculateAttack() {
    return this.attack * this.attackRate + this.attackBonus;
  }

  /**
   *
   * @param {Number} damage
   * @returns {Number}
   */
  calculateDamage(damage) {
    if (this.defenseRate == 0) {
      throw "defenseRate could not be 0";
    }
    return Math.max(
      Math.ceil(damage / this.defenseRate - this.defenseBonus),
      0
    );
  }

  makeDamage(damage) {
    this.hp -= this.calculateDamage(damage);
  }

  /**
   * Get count of BZs of specific color
   * @param {String} color Default "綠" Type of bz "紅" "藍" "黑" "綠"
   * @returns {Number}
   */
  getBZCount(color = "綠") {
    return this.bzs.filter(bz => bz == color).length;
  }

  /**
   * @returns {Boolean}
   */
  isSmallMistake() {
    return this.getBZCount() == 2;
  }

  /**
   * @returns {Boolean}
   */
  isBigMistake() {
    return this.getBZCount() >= 3;
  }

  makeSmallMistake() {
    this.attack = 0;
  }

  makeBigMistake() {
    this.attack = 0;
    // NOTE: 所受傷雙倍 (不確定先計還是後計 目前是先計雙倍)
    this.defenseRate /= 2;
  }
  /**
   * @returns {Boolean}
   */
  canUseSkill() {
    if (this.skillLocked) {
      return false;
    }
    return this.getBZCount(this.color) == 2;
  }

  canUseUltraSkill() {
    if (this.skillLocked) {
      return false;
    }
    return this.getBZCount(this.color) >= 3;
  }

  useSkill() {
    throw "Skill not implemented";
  }

  useUltraSkill() {
    throw "Skill not implemented";
  }
}

/* Item */

class Item {
  constructor(name = "") {}
}

class Weapon extends Item {
  constructor(dice20BonusNum = 0, attackRate = 1, attackBonus = 0) {
    super();
    this.dice20BonusNum = dice20BonusNum;
    this.attackRate = attackRate;
    this.attackBonus = attackBonus;
  }
}

class Armour extends Item {
  constructor(defenseRate = 1, defenseBonus = 0) {
    super();
    this.defenseRate = defenseRate;
    this.defenseBonus = defenseBonus;
  }
}

class Accessory extends Item {
  constructor(bzBonusNum = 0) {
    super();
    this.bzBonusNum = bzBonusNum;
  }
}

/* Role */
class Attacker extends Player {
  constructor(weapon, armour, accessory) {
    super(weapon, armour, accessory);
    this.color = "紅";
  }

  useSkill() {
    this.attackBonus += 5;
  }
  useUltraSkill() {
    this.attackRate *= 2;
    this.delayToLockSkill = true;
  }
}

class Defenser extends Player {
  constructor(weapon, armour, accessory) {
    super(weapon, armour, accessory);
    this.color = "藍";
  }

  useSkill() {
    this.defenseRate *= 2;
  }

  useUltraSkill() {
    this.reflex = true;
  }
}

class Supporter extends Player {
  constructor(weapon, armour, accessory) {
    super(weapon, armour, accessory);
    this.color = "黑";
  }

  fixOverHeal() {
    if (this.hp > 100) {
      this.hp = 100;
    }
  }

  useSkill() {
    this.hp += 5;
    this.fixOverHeal();
  }

  useUltraSkill() {
    this.hp += 20;
    this.fixOverHeal();
  }
}

function simulate(
  round = 1,
  playerA = new Attacker(),
  playerB = new Attacker()
) {
  let aWin = 0,
    bWin = 0;
  for (let i = 0; i < round; i++) {
    playerA.initStatus(true);
    playerB.initStatus(true);
    do {
      Player.attackEachOther(playerA, playerB);
      // console.log(`A: ${playerA.getHp()} B: ${playerB.getHp()}`);
    } while (
      (playerA.getHp() > 0 && playerB.getHp() > 0) ||
      playerA.getHp() == playerB.getHp()
    );

    if (playerA.getHp() > playerB.getHp()) {
      aWin += 1;
      // console.log("A Win!");
    } else {
      bWin += 1;
      // console.log("B Win!");
    }
    // console.log(`A: ${playerA.getHp()} B: ${playerB.getHp()}`);
  }
  return `A Win: ${aWin}, B Win: ${bWin}`;
}
