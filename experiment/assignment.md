**1.** How is Viterbi decoding different from the forward algorithm? Explain the key differences in terms of:

- Objective (what each algorithm computes)
- Mathematical formulation
- Practical applications in NLP

**2.** How is Viterbi decoding more efficient than a brute force approach for finding the optimal tag sequence? Calculate and compare:

- Time complexity of brute force method for a sentence of length N with T possible tags
- Time complexity of Viterbi algorithm
- Provide a concrete example with N=5 words and T=10 tags

**3.** Given the following emission and transition probability matrices, manually compute the Viterbi table for the sentence "The dog runs":

**Emission Matrix P(word|tag):**

```
         The    dog    runs
Noun     0.1    0.6    0.1
Verb     0.0    0.1    0.8
Det      0.9    0.0    0.0
```

**Transition Matrix P(tag_j|tag_i):**

```
         Noun   Verb   Det
Noun     0.3    0.4    0.1
Verb     0.4    0.1    0.2
Det      0.7    0.2    0.1
```

Assume equal initial probabilities π[tag] = 1/3 for all tags.

**4.** Analyze the role of transition vs. emission probabilities:

- Create a scenario where high emission probability conflicts with low transition probability
- Explain how the Viterbi algorithm resolves such conflicts
- Discuss which type of probability is more important for overall tagging accuracy

**5.** Implement smoothing for unseen events:

- How would you handle a word that doesn't appear in your emission matrix?
- How would you handle a tag transition that has zero probability in your transition matrix?
- Propose specific smoothing techniques and justify your choices

**6.** Consider the sentence "Bank the money in the bank" where "bank" can be both a noun (financial institution) and a verb (to deposit):

- Explain how context helps the Viterbi algorithm choose the correct POS tag for each occurrence
- Discuss what happens if your training data has unbalanced occurrences of ambiguous words

**7.** Dynamic Programming Properties:

- Prove that the POS tagging problem exhibits optimal substructure
- Explain why the Markov assumption is crucial for the Viterbi algorithm's correctness
- What would happen if we violated the Markov assumption?

**8.** Compare and contrast Viterbi decoding with modern neural approaches:

- What are the advantages of HMM-based tagging?
- What are the limitations that neural networks address?
- In what scenarios might you still prefer Viterbi decoding?
