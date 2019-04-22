disp("___Question 47___")

A = [-25 -9 -27; 536 185 537; 154 52 143]

B = [A,[0;1;0]];
secondCol = rref(B);
B = [A,[0;0;1]];
thirdCol = rref(B);

result = [secondCol(:, 4), thirdCol(:, 4)]