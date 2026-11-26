// LITTLE DAY 동물 NPC 대화 데이터 (낮/밤 시간대 연동 + 분기 선택지 + 퀘스트/단서 훅 확장 구조)
// 새로운 동물 NPC를 추가할 때는 NPC_DATA에 키와 day/night dialogueTrees를 등록하면 됩니다.

import { QuestState } from './quest.js';

export const NPC_DATA = {
  rabbit: {
    id: 'rabbit',
    name: '버니 (토끼 주민)',
    displayName: '버니',
    species: 'rabbit',
    dayRole: '토끼 주민',
    nightRole: '밤의 모습',
    portrait: '🐰',
    portraitType: 'rabbit',
    color: '#ffb3c8',
    accentColor: '#ff9eb8',
    talkable: true,
    // 기존 호환용 기본 대사
    dialogues: [
      '오늘은 마을이 유난히 조용하네. 이상하지 않아?'
    ],
    dialogueTrees: {
      day: {
        startNode: 'day_first',
        repeatStartNode: 'day_repeat',
        nodes: {
          day_first: {
            lines: [
              '오늘은 마을이 유난히 조용하네. 이상하지 않아?'
            ],
            choices: [
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'day_lighthouse' },
              { id: 'night_change', text: '밤에는 왜 달라지는 거야?', next: 'day_night_change' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'day_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'day_later' }
            ]
          },
          day_repeat: {
            lines: [
              '다시 왔구나! 낮에는 꽃향기 덕분에 평화로워 보여도...\n가끔 바다 쪽에서 들리는 바람 소리가 신경 쓰여.'
            ],
            choices: [
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'day_lighthouse' },
              { id: 'night_change', text: '밤에는 왜 달라지는 거야?', next: 'day_night_change' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'day_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'day_later' }
            ]
          },
          day_lighthouse: {
            lines: [
              '언덕 너머 낡은 등대 말이야? 낮에는 그냥 평범한 하얀 탑처럼 보이지만...',
              '며칠 전부터 해가 질 무렵이면 이상한 기척이 느껴진대.\n자세한 건 밤이 되어야 알 수 있을 것 같아.'
            ],
            next: null,
            questHook: 'hint_lighthouse_day'
          },
          day_night_change: {
            lines: [
              '어, 어라? 그걸 벌써 눈치챈 거야?\n낮에는 이렇게 포근한 토끼 모습으로 꽃밭을 돌보며 지내지만...',
              '밤 8시가 지나 달빛이 내려앉으면 우리 모두 조금 다른 모습이 되곤 해.\n밤에 다시 찾아오면 직접 느낄 수 있을 거야.'
            ],
            next: null
          },
          day_island_secret: {
            lines: [
              '이 섬은 오래전부터 달빛과 깊은 인연이 있는 곳이야.\n낮에는 다정한 마을이지만, 밤이 되면 잊혀진 기억들이 깨어나곤 한대.',
              '북쪽 숲이나 달빛 섬 쪽에도 오래된 흔적이 남아 있다는 소문이 있어.'
            ],
            next: null
          },
          day_later: {
            lines: [
              '응, 천천히 마을을 둘러보렴!\n해가 지고 밤이 찾아오면... 혹시 다시 이야기할 수 있을까?'
            ],
            next: null
          }
        }
      },
      night: {
        startNode: 'night_first',
        repeatStartNode: 'night_repeat',
        nodes: {
          night_first: {
            lines: [
              '쉿... 밤에는 절대 등대 쪽을 바라보지 마.'
            ],
            choices: [
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'night_lighthouse' },
              { id: 'night_change', text: '밤에는 왜 달라지는 거야?', next: 'night_change' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'night_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'night_later' }
            ]
          },
          night_repeat: {
            lines: [
              '또 밤중에 걸어 나왔구나... 귀를 기울여 봐.\n파도 소리 사이로 등대 쪽에서 희미한 종소리 같은 게 들리지 않아?'
            ],
            choices: [
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'night_lighthouse' },
              { id: 'night_change', text: '밤에는 왜 달라지는 거야?', next: 'night_change' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'night_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'night_later' }
            ]
          },
          night_lighthouse: {
            lines: [
              '꺼져 있어야 할 등대 꼭대기에서, 달이 가장 높이 뜨는 밤마다 푸른 불빛이 스쳐 지나가.\n그 빛을 오래 바라본 주민은 다음 날 아침 기억을 잃고 말았어.',
              '네가 진실을 찾으려 한다면... 낮의 평온함에 속지 말고 등대의 흔적을 기억해 둬.'
            ],
            next: null,
            clueId: 'clue_rabbit_lighthouse',
            clueTitle: '밤의 등대와 푸른 불빛',
            questHook: 'discover_lighthouse_clue'
          },
          night_change: {
            lines: [
              '밤이 되면 귀가 조금 더 밝아져.\n낮에는 들리지 않던 바람 소리도, 풀잎 사이를 지나가는 작은 발소리도 들리거든.',
              '그런데 말이야… 이 섬의 밤에는 나만 들을 수 있는 소리가 하나 더 있어.'
            ],
            next: null,
            clueId: 'clue_rabbit_beastkin',
            clueTitle: '달빛 아래 깨어나는 감각'
          },
          night_island_secret: {
            lines: [
              '예전에는 이 섬에 등대지기와 숲의 수호자들이 함께 살았대.\n하지만 어느 붉은 달이 뜬 밤 이후로 모든 기록이 사라져 버렸어.',
              '어쩌면 밤의 폭시도 오래된 저택과 섬의 과거에 대해 무언가 알고 있을지 몰라.'
            ],
            next: null,
            clueId: 'clue_rabbit_island_past',
            clueTitle: '사라진 등대지기의 기록',
            questHook: 'discover_island_past_clue'
          },
          night_later: {
            lines: [
              '조심해서 돌아가...\n밤안개가 짙어지기 전에 가로등 불빛 아래로 걷는 게 좋아.'
            ],
            next: null
          }
        }
      }
    }
  },

  fox: {
    id: 'fox',
    name: '폭시 (여우 주민)',
    displayName: '폭시',
    species: 'fox',
    dayRole: '여우 주민',
    nightRole: '밤의 모습',
    portrait: '🦊',
    portraitType: 'fox',
    color: '#f6aa6a',
    accentColor: '#ee9552',
    talkable: true,
    questId: 'fox_pink_flower',
    dialogues: [
      '반가워! 우리 마을은 처음이지? 천천히 둘러보렴.'
    ],
    dialogueTrees: {
      day: {
        startNode: 'day_first',
        repeatStartNode: 'day_repeat',
        nodes: {
          day_first: {
            lines: [
              '반가워! 오늘 날씨가 참 따뜻해서 산책하기 좋지 않아?\n마침 너한테 물어보고 싶은 것도, 작은 부탁도 하나 있어!'
            ],
            choices: [
              { id: 'fox_quest', text: '무슨 부탁이야? (퀘스트)', next: 'day_quest_offer' },
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'day_lighthouse' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'day_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'day_later' }
            ]
          },
          day_repeat: {
            lines: [
              '또 왔네! 북쪽 벚꽃나무 아래에서 바람 쐬다 방금 돌아왔어.\n무슨 이야기가 궁금해서 왔어?'
            ],
            choices: [
              { id: 'fox_quest', text: '부탁했던 꽃 이야기를 하자', next: 'day_quest_status' },
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'day_lighthouse' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'day_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'day_later' }
            ]
          },
          day_quest_offer: {
            lines: [
              '소중한 친구에게 줄 꽃다발을 만들고 싶은데, 마을 주변에서 분홍색 꽃 3개만 찾아줄 수 있어?',
              '마을 정원 꽃밭과 산책로 주변을 잘 살펴보면 찾을 수 있을 거야.\n다 모아오면 특별한 선물을 줄게!'
            ],
            next: null,
            questHook: 'start_fox_pink_flower'
          },
          day_quest_status: {
            lines: [
              '마을 주변 꽃밭을 천천히 둘러보면 분홍색 꽃이 반짝이고 있을 거야.\n무리하지 말고 천천히 모아줘!'
            ],
            next: null
          },
          day_quest_complete: {
            lines: [
              '우와! 정말 예쁜 꽃이야!\n이렇게 많이 모아주다니 정말 고마워!',
              '고마운 마음을 담아 내가 아껴두던 반짝이는 조개를 선물로 줄게.\n분명 앞으로 이 섬의 비밀을 푸는 데 도움이 될 거야!'
            ],
            next: null
          },
          day_quest_done: {
            lines: [
              '네가 전달해 준 분홍색 꽃으로 만든 꽃다발, 친구가 정말 좋아했어!\n선물로 건넨 반짝이는 조개는 가방에 잘 보관하고 있니?'
            ],
            next: null
          },
          day_quest_shortage: {
            lines: [
              '아직 분홍색 꽃이 부족해서 전달할 수 없어!\n마을 주변에서 분홍색 꽃 3개를 모두 모아서 다시 가져와 줘.'
            ],
            next: null
          },
          day_quest_deliver_prompt: {
            lines: [
              '정말 분홍색 꽃을 다 모아온 거야? 얼른 보여줘!'
            ],
            next: null,
            questHook: 'request_fox_pink_flower_delivery'
          },
          day_lighthouse: {
            lines: [
              '등대? 낮에는 그냥 바람 잘 부는 언덕 위의 오래된 건물이지.\n그래도 해가 지고 나면 분위기가 완전히 달라진다는 소문이 있어.',
              '진짜 이야기가 궁금하면 밤 8시 이후에 다시 찾아와 봐. 그때는 조금 다르게 대답해 줄지도 몰라.'
            ],
            next: null
          },
          day_island_secret: {
            lines: [
              '후훗, 눈치가 빠르네! 이 마을은 겉보기엔 평화롭지만, 밤이 되면 진짜 얼굴을 보여줘.\n버니도 밤에는 꽤 다른 이야기를 꺼내곤 하거든.'
            ],
            next: null
          },
          day_later: {
            lines: [
              '그래! 언제든 이야기 나누고 싶으면 날 찾아와 줘.'
            ],
            next: null
          }
        }
      },
      night: {
        startNode: 'night_first',
        repeatStartNode: 'night_repeat',
        nodes: {
          night_first: {
            lines: [
              '후훗... 밤에 나를 찾아오다니, 꽤 담력이 있네.\n낮의 모습만 보고 이 섬을 다 안다고 생각하면 곤란하지.'
            ],
            choices: [
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'night_lighthouse' },
              { id: 'night_change', text: '밤에는 왜 달라지는 거야?', next: 'night_change' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'night_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'night_later' }
            ]
          },
          night_repeat: {
            lines: [
              '달빛 아래서 또 마주쳤네.\n밤의 여우에게 더 캐묻고 싶은 비밀이 남은 모양이구나?'
            ],
            choices: [
              { id: 'lighthouse', text: '등대에 무슨 일이 있어?', next: 'night_lighthouse' },
              { id: 'night_change', text: '밤에는 왜 달라지는 거야?', next: 'night_change' },
              { id: 'island_secret', text: '이 섬에 무슨 비밀이 있는 거야?', next: 'night_island_secret' },
              { id: 'later', text: '다음에 다시 이야기하자.', next: 'night_later' }
            ]
          },
          night_lighthouse: {
            lines: [
              '등대는 배를 안내하기 위해서만 세워진 게 아니야.\n바다 건너에서 밀려오는 안개와 기억의 틈을 잠재우던 장치였지.',
              '불빛이 약해진 뒤로 밤마다 숲과 저택 주변에 이상한 흔적이 늘어나고 있어.'
            ],
            next: null,
            clueId: 'clue_fox_lighthouse',
            clueTitle: '안개를 잠재우던 등대의 역할',
            questHook: 'discover_lighthouse_clue'
          },
          night_change: {
            lines: [
              '후훗, 밤바람을 쐬면 낮에는 잊고 지내던 오래된 기억들이 스멀스멀 떠오르곤 해.',
              '달빛이 꼬리 끝까지 닿을 때쯤이면, 평소엔 그냥 지나치던 작은 흔적이나 숨겨진 문도 유독 또렷하게 보이거든.'
            ],
            next: null,
            clueId: 'clue_fox_beastkin',
            clueTitle: '달빛 아래 되살아나는 기억'
          },
          night_island_secret: {
            lines: [
              '밤 10시가 되면 마을 어딘가에 푸른 달빛 꽃이 피어난다는 이야기, 들어봤어?\n그 꽃과 오래된 저택, 그리고 꺼져가는 등대는 모두 하나의 과거로 이어져 있어.',
              '단서를 하나씩 모아가다 보면, 이 섬이 왜 너를 불렀는지 알게 될 거야.'
            ],
            next: null,
            clueId: 'clue_fox_island_secret',
            clueTitle: '달빛 꽃과 저택, 등대의 연결고리',
            questHook: 'discover_island_past_clue'
          },
          night_later: {
            lines: [
              '그래, 밤길이 어두우니 발밑 조심해.\n다음에 또 달빛 아래에서 보자고.'
            ],
            next: null
          }
        }
      }
    }
  }
};

export function getNpcData(npcId) {
  return NPC_DATA[npcId] || null;
}

/**
 * NPC ID, 현재 시간대(낮/밤), 이전 대화 완료 여부 및 퀘스트 상태를 조합하여
 * 실제 재생할 분기 대화 트리(dialogueTree)를 동적으로 해석합니다.
 */
export function resolveNpcDialogueTree(npcId, context = {}) {
  const npcData = NPC_DATA[npcId];
  if (!npcData || !npcData.dialogueTrees) return null;

  const isNight = Boolean(context.isNight);
  const period = isNight ? 'night' : 'day';
  const baseTree = npcData.dialogueTrees[period] || npcData.dialogueTrees.day;
  if (!baseTree) return null;

  // 깊은 복사(선택지/노드 안전 커스터마이징용)
  const nodes = {};
  for (const [key, node] of Object.entries(baseTree.nodes || {})) {
    nodes[key] = {
      ...node,
      lines: Array.isArray(node.lines) ? [...node.lines] : [],
      choices: Array.isArray(node.choices) ? node.choices.map((c) => ({ ...c })) : undefined
    };
  }

  let startNode =
    context.hasCompleted && baseTree.repeatStartNode && nodes[baseTree.repeatStartNode]
      ? baseTree.repeatStartNode
      : baseTree.startNode;

  // 폭시 대화: 분홍색 꽃 수집·전달·보상 완료 상태와 선택지/대사 실시간 연동
  if (npcId === 'fox' && context.foxQuestState) {
    const qState = context.foxQuestState;
    const cur = context.foxInventoryCount ?? context.foxCollectedCount ?? 0;
    const target = context.foxTargetCount ?? 3;

    if (!isNight) {
      if (qState === QuestState.IN_PROGRESS) {
        startNode = 'day_repeat';
        nodes.day_repeat.lines = [
          `분홍색 꽃을 찾고 있구나! (보유 중: ${cur}/${target}개)\n꽃 3개를 모두 모으면 나에게 전달해 줘!`
        ];
        if (nodes.day_repeat.choices?.[0]) {
          nodes.day_repeat.choices[0].text = '부탁했던 꽃 이야기를 하자';
          nodes.day_repeat.choices[0].next = 'day_quest_shortage';
        }
        nodes.day_quest_shortage.lines = [
          `아직 분홍색 꽃이 부족해서 전달할 수 없어! (현재 보유: ${cur}/${target}개)\n마을 정원 꽃밭과 산책로 주변을 살펴보면 금방 찾을 수 있을 거야.`
        ];
      } else if (qState === QuestState.READY_TO_COMPLETE) {
        startNode = 'day_repeat';
        nodes.day_repeat.lines = [
          '어! 분홍색 꽃 3개를 모두 모아온 거야?\n지금 나한테 전달해 줄래?'
        ];
        if (nodes.day_repeat.choices?.[0]) {
          nodes.day_repeat.choices[0].text = '모은 꽃을 전달할게!';
          nodes.day_repeat.choices[0].next = cur >= target ? 'day_quest_deliver_prompt' : 'day_quest_shortage';
        }
        nodes.day_quest_shortage.lines = [
          `어라, 가방에 분홍색 꽃이 부족해서 전달할 수 없어! (필요: ${target}개, 보유: ${cur}개)`
        ];
      } else if (qState === QuestState.DELIVERED || qState === QuestState.COMPLETED) {
        startNode = 'day_repeat';
        if (!context.hasSeenFoxCompletion) {
          nodes.day_repeat.lines = [
            '우와! 정말 예쁜 꽃이야!\n이렇게 많이 모아주다니 정말 고마워!'
          ];
          nodes.day_repeat.questHook = 'ack_fox_completion';
        } else {
          nodes.day_repeat.lines = [
            '네가 전달해 준 분홍색 꽃 덕분에 정말 멋진 꽃다발이 완성됐어!\n선물로 준 반짝이는 조개도 소중히 간직해 줘!'
          ];
        }
        if (nodes.day_repeat.choices?.[0]) {
          nodes.day_repeat.choices[0].text = '꽃다발과 조개 이야기 물어보기';
          nodes.day_repeat.choices[0].next = 'day_quest_done';
        }
      } else if (qState === QuestState.NOT_STARTED && context.hasCompleted) {
        if (nodes.day_repeat.choices?.[0]) {
          nodes.day_repeat.choices[0].text = '무슨 부탁이야? (퀘스트)';
          nodes.day_repeat.choices[0].next = 'day_quest_offer';
        }
      }
    } else if (qState === QuestState.READY_TO_COMPLETE) {
      // 밤 시간대에도 꽃 3개를 모두 모은 상태라면 전달 선택지를 최상단에 노출
      const activeStart = nodes[startNode];
      if (activeStart && Array.isArray(activeStart.choices)) {
        activeStart.choices.unshift({
          id: 'fox_deliver_night',
          text: '모은 꽃을 전달할게!',
          next: cur >= target ? 'night_quest_deliver_prompt' : 'night_quest_shortage'
        });
      }
      nodes.night_quest_deliver_prompt = {
        lines: ['어라, 이 밤중에 분홍색 꽃 3개를 다 모아온 거야? 얼른 보여줘!'],
        next: null,
        questHook: 'request_fox_pink_flower_delivery'
      };
      nodes.night_quest_shortage = {
        lines: [`가방에 분홍색 꽃이 부족해서 전달할 수 없어! (필요: ${target}개, 보유: ${cur}개)`],
        next: null
      };
    }
  }

  return {
    period,
    isNight,
    startNode,
    nodes
  };
}
