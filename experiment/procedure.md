Follow these steps to complete the Viterbi Decoding experiment:

### Step 1: Corpus Selection

- Open the simulation interface
- Select a corpus from the dropdown menu (Corpus A, B, or C)
- By default, Corpus A is loaded with the training sentence: _"Book a car. Park the car. The book is in the car. The car is in a park."_
- Observe how this training corpus is used to generate probability matrices

### Step 2: Understanding the Training Data

- **Left Pane**: Examine the full training sentence and the derived probability matrices
- **Emission Matrix**: Shows P(word|tag) - probability of each word given each POS tag
- **Transition Matrix**: Shows P(tag₂|tag₁) - probability of tag transitions
- Note how these matrices capture statistical patterns from the training corpus

### Step 3: Analyze the Test Sentence

- **Right Pane**: Focus on the test sentence (e.g., _"Book a park"_ for Corpus A)
- Click the info icon (ⓘ) next to the test sentence to understand why this specific sentence was chosen
- Observe the empty Viterbi decoding table with:
  - Columns representing words in the test sentence
  - Rows representing possible POS tags (Noun, Verb, Det)

### Step 4: Fill the Viterbi Table

- Start with the first column (first word)
- For each cell, calculate: **emission probability × transition probability**
- Work column by column from left to right
- For subsequent columns, use: **max(previous_column × transition) × emission**
- Enter your calculated values in the input fields

### Step 5: Validate Your Work

- Click **"Check"** to validate all your entries
- The system provides immediate feedback:
  - ✅ Correct values are accepted
  - ❌ Incorrect values trigger error messages
- Revise incorrect entries and check again

### Step 6: Use Learning Aids

- **"Show Hint"**: Click for algorithmic guidance and computation tips
- **"Show Answer"**: Compare your entries with correct values (only after attempting)
  - Red values indicate your incorrect entries
  - Green values show the correct answers
  - Side-by-side comparison helps identify calculation errors

### Step 7: Complete the Decoding

- Once all Viterbi table entries are correct, the simulation automatically reveals:
  - The optimal POS tag sequence for the test sentence
  - A results table showing the decoded tags below each word

### Step 8: Try Different Corpora

- Select **Corpus B**: _"The quick brown fox jumps over the lazy dog"_ → _"The quick fox jumps"_
- Select **Corpus C**: _"She sells sea shells by the sea shore"_ → _"She sells shells"_
- Compare how different training data affects:
  - Probability matrix values
  - Optimal tag sequences
  - Decoding difficulty

### Step 9: Reset and Practice

- Use **"Reset"** to clear your work and start over
- Try different corpora to practice with various vocabulary and sentence structures
- Focus on understanding the relationship between training data and decoding outcomes

### Learning Tips

- **Mathematical Understanding**: Focus on how each cell value is computed using dynamic programming
- **Linguistic Intuition**: Consider why certain tag sequences are more probable than others
- **Error Analysis**: When answers are incorrect, analyze whether the error was in:
  - Emission probability lookup
  - Transition probability lookup
  - Mathematical computation
  - Understanding of the algorithm

This hands-on approach reinforces theoretical understanding of the Viterbi algorithm while providing practical experience with statistical POS tagging.
