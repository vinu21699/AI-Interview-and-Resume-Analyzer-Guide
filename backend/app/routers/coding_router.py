from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CodingTest
from app.schemas import CodeExecutionRequest
from app.auth import get_current_user
from app.code_runner import execute_user_code

router = APIRouter(prefix="/api/coding", tags=["Coding Interview"])

CODING_CHALLENGES = [
    {
        "id": "two-sum",
        "title": "Two Sum",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}
        ],
        "starter_code": {
            "python": "def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))",
            "javascript": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));",
            "java": "public class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{0, 1};\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    return {0, 1};\n}"
        }
    },
    {
        "id": "valid-anagram",
        "title": "Valid Anagram",
        "difficulty": "Easy",
        "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        "examples": [
            {"input": "s = \"anagram\", t = \"nagaram\"", "output": "true"}
        ],
        "starter_code": {
            "python": "def is_anagram(s: str, t: str) -> bool:\n    return sorted(s) == sorted(t)\n\nprint(is_anagram('anagram', 'nagaram'))",
            "javascript": "function isAnagram(s, t) {\n  return s.split('').sort().join('') === t.split('').sort().join('');\n}\n\nconsole.log(isAnagram('anagram', 'nagaram'));",
            "java": "public class Solution {\n    public static boolean isAnagram(String s, String t) {\n        return true;\n    }\n}",
            "cpp": "bool isAnagram(string s, string t) {\n    return true;\n}"
        }
    }
]

@router.get("/challenges")
def get_challenges():
    return CODING_CHALLENGES

@router.post("/execute")
def run_code(
    req: CodeExecutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = execute_user_code(req.language, req.code)

    # Save attempt
    db_test = CodingTest(
        user_id=current_user.id,
        title=req.challenge_id or "Custom Coding Challenge",
        language=req.language,
        code_submitted=req.code,
        status=result.get("status", "passed"),
        ai_feedback=result.get("ai_feedback", "")
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)

    return result

@router.get("/history")
def get_coding_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tests = db.query(CodingTest).filter(CodingTest.user_id == current_user.id).order_by(CodingTest.id.desc()).all()
    return tests
