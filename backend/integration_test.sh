#!/usr/bin/env bash
# Phase 1 + Phase 2 快速集成验证
# 用法: bash backend/integration_test.sh
set -e

BASE="${API_BASE:-http://localhost:8000/api}"

echo "=== [1/7] Health check ==="
curl -sf $BASE/health | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['status']=='ok', d"
echo "OK"

echo "=== [2/7] Register ==="
TOKEN=$(curl -sf -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ci_'"$RANDOM"'@test.com","password":"pass1234","name":"CI User"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "OK (token obtained)"

echo "=== [3/7] Create session ==="
SID=$(curl -sf -X POST $BASE/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode":"conversation"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['status']=='active'; print(d['id'])")
echo "OK (session=$SID)"

echo "=== [4/7] Chat (with grammar error for detection) ==="
REPLY=$(curl -sf -X POST $BASE/conversation/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"$SID\",\"message\":\"Yesterday I go to school and I think about this thing.\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['reply']; print(d['reply'][:60])")
echo "OK (reply: $REPLY...)"

echo "=== [5/7] End session (triggers analysis pipeline) ==="
STATUS=$(curl -sf -X POST $BASE/sessions/$SID/end \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status'])")
[ "$STATUS" = "completed" ] || { echo "FAIL: expected status=completed, got $STATUS"; exit 1; }
echo "OK (status=$STATUS)"

echo "=== [6/7] Check pronunciation assessment ==="
SCORE=$(curl -sf $BASE/assessments/$SID \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
assert 0 <= d['overall_score'] <= 100, f\"score out of range: {d['overall_score']}\"
assert len(d['phoneme_alignment']) > 0, 'phoneme_alignment is empty'
types = {a['type'] for a in d['phoneme_alignment']}
assert 'correct' in types, f'no correct phonemes found, types={types}'
print(d['overall_score'])
")
echo "OK (score=$SCORE, phoneme_alignment non-empty)"

echo "=== [7/7] Check BKT knowledge states ==="
COUNT=$(curl -sf $BASE/assessments/knowledge/states \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "
import sys,json
lst = json.load(sys.stdin)
assert len(lst) > 0, 'knowledge_states is empty — BKT update may have failed'
for ks in lst:
    assert 0 <= ks['p_mastery'] <= 1, f\"p_mastery out of range: {ks}\"
print(len(lst))
")
echo "OK ($COUNT skill states updated, all p_mastery in [0,1])"

echo ""
echo "=============================================="
echo " All Phase 1 + Phase 2 integration tests PASSED"
echo "=============================================="
