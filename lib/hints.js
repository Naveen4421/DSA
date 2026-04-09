export const HINTS = {
    1: [
        "Could you use a hash map to check for the complement in O(1) time?",
        "Complement = target - current_element",
        "Store the elements you've seen so far in the map with their indices."
    ],
    2: [
        "Think about the minimum price seen so far.",
        "If you sell today, what was the best day to buy in the past?",
        "Update the minimum price and calculate the potential profit at each step."
    ],
    3: [
        "A HashSet can store unique elements and check for existence in O(1).",
        "Iterate through the array and add each element to the set.",
        "If an element is already in the set, you've found a duplicate."
    ],
    4: [
        "You can't use division. Can you use prefix and suffix products?",
        "The product except an element is (product of all left) * (product of all right).",
        "Calculate the prefix products in one pass and suffix products in another."
    ],
    8: [
        "Sort the array first. This allows you to use the two-pointer approach.",
        "Fix one number and use two pointers to find the other two.",
        "If the sum is too large, move the right pointer; if too small, move the left pointer."
    ],
    20: [
        "Use a sliding window with two pointers: left and right.",
        "Use a map or set to keep track of characters in the current window.",
        "If you encounter a duplicate, shrink the window from the left."
    ],
    30: [
        "Use two pointers: one at the beginning and one at the end.",
        "Move pointers towards the center, skipping non-alphanumeric characters.",
        "Compare the characters at each pointer (ignore case)."
    ],
    120: [
        "Think of this as a variation of the Fibonacci sequence.",
        "To reach step n, you could have come from step n-1 or n-2.",
        "The number of ways to reach step n is ways(n-1) + ways(n-2)."
    ]
};

export const getHints = (problemId) => {
    return HINTS[problemId] || ["No hints available for this problem yet. Try using the pattern specified above!"];
};
