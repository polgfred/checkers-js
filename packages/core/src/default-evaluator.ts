import { makeEvaluator } from './evaluator';

const defaultEvaluator = makeEvaluator();

// basic piece values
defaultEvaluator.addFormation(
  [{ dx: 0, dy: 0, value: 1 }],
  // prettier-ignore
  [ 
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [ 50,  0, 50,  0, 50,  0, 50,  0 ],
    [  0, 50,  0, 50,  0, 50,  0, 50 ],
    [ 50,  0, 50,  0, 50,  0, 50,  0 ],
    [  0, 50,  0, 50,  0, 50,  0, 50 ],
    [ 50,  0, 50,  0, 50,  0, 50,  0 ],
    [  0, 50,  0, 50,  0, 50,  0, 50 ],
    [ 50,  0, 50,  0, 50,  0, 50,  0 ],
   ].reverse()
);

// basic king values
defaultEvaluator.addFormation(
  [{ dx: 0, dy: 0, value: 2 }],
  // prettier-ignore
  [ 
    [  0, 60,  0, 60,  0, 60,  0, 60 ],
    [ 60,  0, 60,  0, 60,  0, 60,  0 ],
    [  0, 60,  0, 60,  0, 60,  0, 60 ],
    [ 60,  0, 60,  0, 60,  0, 60,  0 ],
    [  0, 60,  0, 60,  0, 60,  0, 60 ],
    [ 60,  0, 60,  0, 60,  0, 60,  0 ],
    [  0, 60,  0, 60,  0, 60,  0, 60 ],
    [ 60,  0, 60,  0, 60,  0, 60,  0 ],
   ].reverse()
);

// offensive lines
defaultEvaluator.addFormation(
  [
    { dx: 0, dy: 0, value: 3 },
    { dx: 1, dy: -1, value: 3 },
  ],
  // prettier-ignore
  [ 
    [  0, 12,  0,  8,  0,  0,  0,  0 ],
    [ 12,  0, 10,  0,  6,  0,  0,  0 ],
    [  0, 10,  0,  8,  0,  4,  0,  0 ],
    [  8,  0,  8,  0,  6,  0,  2,  0 ],
    [  0,  6,  0,  6,  0,  4,  0,  0 ],
    [  0,  0,  4,  0,  4,  0,  2,  0 ],
    [  0,  0,  0,  2,  0,  2,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
   ].reverse()
);

// offensive 3-lines
defaultEvaluator.addFormation(
  [
    { dx: 0, dy: 0, value: 3 },
    { dx: 1, dy: -1, value: 3 },
    { dx: 2, dy: -2, value: 3 },
  ],
  // prettier-ignore
  [ 
    [  0, 12,  0,  8,  0,  0,  0,  0 ],
    [ 12,  0, 10,  0,  6,  0,  0,  0 ],
    [  0, 10,  0,  8,  0,  4,  0,  0 ],
    [  8,  0,  8,  0,  6,  0,  0,  0 ],
    [  0,  6,  0,  6,  0,  4,  0,  0 ],
    [  0,  0,  4,  0,  4,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
   ].reverse()
);

// triangle bases
defaultEvaluator.addFormation(
  [
    { dx: 0, dy: 0, value: 3 },
    { dx: 1, dy: -1, value: 3 },
    { dx: -1, dy: -1, value: 3 },
  ],
  // prettier-ignore
  [ 
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0, 12,  0,  8,  0,  4,  0 ],
    [  0,  8,  0, 12,  0,  8,  0,  0 ],
    [  0,  0,  8,  0, 12,  0,  8,  0 ],
    [  0,  4,  0, 12,  0, 12,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
   ].reverse()
);

// defensive lines
defaultEvaluator.addFormation(
  [
    { dx: 0, dy: 0, value: 3 },
    { dx: -1, dy: -1, value: 3 },
  ],
  // prettier-ignore
  [ 
    [  0,  0,  0,  0,  0, 10,  0, 16 ],
    [  0,  0,  0,  0,  8,  0, 12,  0 ],
    [  0,  0,  0,  6,  0, 10,  0, 10 ],
    [  0,  0,  4,  0,  8,  0,  8,  0 ],
    [  0,  2,  0,  6,  0,  6,  0,  0 ],
    [  0,  0,  4,  0,  4,  0,  0,  0 ],
    [  0,  2,  0,  2,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
   ].reverse()
);

// defensive 3-lines
defaultEvaluator.addFormation(
  [
    { dx: 0, dy: 0, value: 3 },
    { dx: -1, dy: -1, value: 3 },
    { dx: -2, dy: -2, value: 3 },
  ],
  // prettier-ignore
  [ 
    [  0,  0,  0,  0,  0, 10,  0, 16 ],
    [  0,  0,  0,  0,  8,  0, 12,  0 ],
    [  0,  0,  0,  6,  0, 10,  0, 10 ],
    [  0,  0,  4,  0,  8,  0,  8,  0 ],
    [  0,  0,  0,  6,  0,  6,  0,  0 ],
    [  0,  0,  4,  0,  4,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
   ].reverse()
);

export default defaultEvaluator;
