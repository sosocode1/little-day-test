// LITTLE DAY 첫 번째 환경 탐험 퍼즐 시스템: 오래된 등대의 비밀
// - 단서 발견 상태 관리, 등대 접근/입구/장치 조사 상태 관리, 정답 검증, Web Audio 효과음, 세이브 연동

import {
  LIGHTHOUSE_PUZZLE_ID,
  LIGHTHOUSE_CLUES,
  LIGHTHOUSE_SOLUTION,
  getLighthouseClue
} from '../data/lighthousePuzzle.js';

// 절차적 Web Audio API 효과음 생성기 (외부 오디오 파일 의존성 없음)
class PuzzleSoundEngine {
  constructor() {
    this.ctx = null;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch (e) {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq, duration = 0.22, type = 'sine', volume = 0.12, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  playSymbolTap(stepIndex = 0) {
    const notes = [523.25, 587.33, 659.25, 783.99];
    const freq = notes[stepIndex % notes.length];
    this.playTone(freq, 0.24, 'triangle', 0.11, 0);
    this.playTone(freq * 2, 0.14, 'sine', 0.04, 0.02);
  }

  playClueFound() {
    this.playTone(587.33, 0.2, 'sine', 0.1, 0);
    this.playTone(880.0, 0.32, 'triangle', 0.09, 0.09);
  }

  playWrongAnswer() {
    this.playTone(220, 0.22, 'sawtooth', 0.06, 0);
    this.playTone(174.61, 0.34, 'triangle', 0.09, 0.11);
  }

  playPuzzleSolved() {
    // 3번의 맑은 종소리 + 신비로운 상승 화음
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((f, idx) => {
      this.playTone(f, 0.55, 'triangle', 0.11, idx * 0.1);
      this.playTone(f * 1.5, 0.45, 'sine', 0.045, idx * 0.1 + 0.03);
    });
    // 등대 종소리 잔향 3회
    [0.42, 0.78, 1.14].forEach((d) => {
      this.playTone(880, 0.7, 'sine', 0.08, d);
      this.playTone(1318.5, 0.5, 'sine', 0.035, d + 0.02);
    });
  }

  playVaultOpen() {
    this.playTone(392.0, 0.3, 'triangle', 0.09, 0);
    this.playTone(523.25, 0.36, 'sine', 0.1, 0.12);
    this.playTone(659.25, 0.45, 'sine', 0.1, 0.24);
    this.playTone(1046.5, 0.6, 'triangle', 0.09, 0.36);
  }
}

export function createLighthousePuzzleSystem({ questSystem = null, inventorySystem = null } = {}) {
  const sound = new PuzzleSoundEngine();
  const listeners = new Set();

  let approached = false;
  let entranceInspected = false;
  let deviceInspected = false;
  let discoveredClues = new Set();
  let puzzleSolved = false;
  let rewardClaimed = false;
  let solveAttempts = 0;

  function notify(eventType = 'update', payload = {}) {
    const snapshot = getStateSnapshot();
    for (const cb of listeners) {
      try {
        cb(snapshot, eventType, payload);
      } catch (e) {
        console.warn('[LighthousePuzzle] Listener error:', e);
      }
    }
  }

  function syncQuestProgress() {
    if (!questSystem || typeof questSystem.syncLighthouseQuest !== 'function') return;
    questSystem.syncLighthouseQuest({
      active: approached || entranceInspected || discoveredClues.size > 0 || deviceInspected || puzzleSolved || rewardClaimed,
      explored: approached || entranceInspected || discoveredClues.size > 0 || deviceInspected || puzzleSolved || rewardClaimed,
      discoveredClueCount: discoveredClues.size,
      totalClues: LIGHTHOUSE_CLUES.length,
      cluesFound: discoveredClues.size >= LIGHTHOUSE_CLUES.length || (discoveredClues.size > 0 && deviceInspected) || puzzleSolved,
      deviceInspected: deviceInspected || puzzleSolved,
      puzzleSolved: puzzleSolved || rewardClaimed,
      rewardClaimed
    });
  }

  function getStateSnapshot() {
    return {
      puzzleId: LIGHTHOUSE_PUZZLE_ID,
      approached,
      entranceInspected,
      deviceInspected,
      discoveredClueIds: Array.from(discoveredClues),
      discoveredClueCount: discoveredClues.size,
      totalClues: LIGHTHOUSE_CLUES.length,
      puzzleSolved,
      rewardClaimed,
      solveAttempts
    };
  }

  return {
    sound,
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getState() {
      return getStateSnapshot();
    },
    isApproached() {
      return approached;
    },
    isEntranceInspected() {
      return entranceInspected;
    },
    isDeviceInspected() {
      return deviceInspected;
    },
    isPuzzleSolved() {
      return puzzleSolved;
    },
    isRewardClaimed() {
      return rewardClaimed;
    },
    hasDiscoveredClue(clueId) {
      return discoveredClues.has(clueId);
    },
    getDiscoveredClues() {
      return LIGHTHOUSE_CLUES.filter((c) => discoveredClues.has(c.id));
    },
    getAllCluesWithStatus() {
      return LIGHTHOUSE_CLUES.map((c) => ({
        ...c,
        discovered: discoveredClues.has(c.id)
      }));
    },

    // 1. 플레이어가 등대 근처에 접근했을 때 (탐험 시작)
    markApproached() {
      if (approached) return false;
      approached = true;
      syncQuestProgress();
      notify('approached');
      return true;
    },

    // 2. 등대 입구 조사
    inspectEntrance() {
      const firstTime = !entranceInspected;
      approached = true;
      entranceInspected = true;
      syncQuestProgress();
      notify('entrance_inspected', { firstTime });
      return { firstTime, puzzleSolved, rewardClaimed };
    },

    // 3. 단서 발견 처리 (중복 방지 + 저장 트리거)
    discoverClue(clueId) {
      const clue = getLighthouseClue(clueId);
      if (!clue) return { ok: false, isNew: false, clue: null };

      approached = true;
      const isNew = !discoveredClues.has(clueId);
      if (isNew) {
        discoveredClues.add(clueId);
        sound.playClueFound();
        if (questSystem && typeof questSystem.recordClue === 'function') {
          questSystem.recordClue(clueId, clue.title);
        }
      }

      syncQuestProgress();
      notify('clue_discovered', { clue, isNew });
      return {
        ok: true,
        isNew,
        clue,
        discoveredCount: discoveredClues.size,
        totalClues: LIGHTHOUSE_CLUES.length
      };
    },

    // 4. 등대 장치 조사 시작
    inspectDevice() {
      const firstTime = !deviceInspected;
      approached = true;
      deviceInspected = true;
      syncQuestProgress();
      notify('device_inspected', { firstTime });
      return { firstTime, puzzleSolved, rewardClaimed };
    },

    // 5. 퍼즐 기호 순서 제출 및 검증
    submitSequence(sequence = []) {
      if (puzzleSolved) {
        return { ok: true, alreadySolved: true };
      }

      solveAttempts += 1;
      const isValid =
        Array.isArray(sequence) &&
        sequence.length === LIGHTHOUSE_SOLUTION.length &&
        sequence.every((sym, idx) => sym === LIGHTHOUSE_SOLUTION[idx]);

      if (!isValid) {
        sound.playWrongAnswer();
        notify('puzzle_wrong', { sequence, attempts: solveAttempts });
        return {
          ok: false,
          alreadySolved: false,
          attempts: solveAttempts,
          message: '장치가 미세하게 흔들리더니 멈췄습니다. 문양의 순서가 맞지 않는 것 같아요. 주변 단서를 다시 확인해 보세요!'
        };
      }

      // 정답!
      approached = true;
      deviceInspected = true;
      puzzleSolved = true;
      sound.playPuzzleSolved();

      if (questSystem && typeof questSystem.recordClue === 'function') {
        questSystem.recordClue('clue_lighthouse_activated', '깨어난 오래된 등대의 장치');
      }

      syncQuestProgress();
      notify('puzzle_solved', { sequence, attempts: solveAttempts });
      return {
        ok: true,
        alreadySolved: false,
        attempts: solveAttempts
      };
    },

    // 6. 숨겨진 비밀 석함에서 보상('오래된 항해 기록') 획득
    claimSecretReward() {
      if (!puzzleSolved) {
        return { ok: false, reason: 'locked' };
      }
      if (rewardClaimed) {
        return { ok: false, reason: 'already_claimed' };
      }

      rewardClaimed = true;
      sound.playVaultOpen();

      // 실제 인벤토리 시스템에 '오래된 항해 기록' 추가 (sourceId로 중복 추가 방지)
      if (inventorySystem && typeof inventorySystem.addItem === 'function') {
        inventorySystem.addItem('old_voyage_log', 1, {
          sourceId: 'lighthouse_puzzle_old_voyage_log'
        });
      }

      if (questSystem && typeof questSystem.recordClue === 'function') {
        questSystem.recordClue('clue_old_voyage_log', '오래된 항해 기록: 사라진 사람들의 이름');
      }

      syncQuestProgress();
      notify('reward_claimed', { itemId: 'old_voyage_log' });
      return { ok: true, itemId: 'old_voyage_log' };
    },

    // 세이브 데이터 추출
    getStateData() {
      return {
        approached,
        entranceInspected,
        deviceInspected,
        discoveredClueIds: Array.from(discoveredClues),
        puzzleSolved,
        rewardClaimed,
        solveAttempts
      };
    },

    // 세이브 데이터 복원
    restore(savedData) {
      if (!savedData || typeof savedData !== 'object') return;
      approached = Boolean(savedData.approached);
      entranceInspected = Boolean(savedData.entranceInspected);
      deviceInspected = Boolean(savedData.deviceInspected);
      discoveredClues = new Set(
        Array.isArray(savedData.discoveredClueIds) ? savedData.discoveredClueIds.filter(Boolean) : []
      );
      puzzleSolved = Boolean(savedData.puzzleSolved);
      rewardClaimed = Boolean(savedData.rewardClaimed);
      solveAttempts = Math.max(0, Number(savedData.solveAttempts) || 0);

      // 보상 획득 완료 상태라면 인벤토리 일관성 보장
      if (rewardClaimed && inventorySystem && typeof inventorySystem.hasItem === 'function') {
        if (!inventorySystem.hasItem('old_voyage_log')) {
          inventorySystem.addItem('old_voyage_log', 1, {
            sourceId: 'lighthouse_puzzle_old_voyage_log'
          });
        }
      }

      syncQuestProgress();
      notify('restored');
    }
  };
}
