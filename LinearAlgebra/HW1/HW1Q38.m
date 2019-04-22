disp("___Question 38____\n")

disp("Find a trivial solution for the following matrix by removing columns til solution is found")
A = [12 10 -6 8 4 -14; -7 -6 4 -5 -7 9; 9 9 -9 9 9 -18;
  -4 -3 -1 0 -8 1; 8 7 -5 6 1 -11]
  
for(i = 6: -1: 1)
  B = A(:, 1:i);
  if(isempty(null(B)))
    disp("trivial solution found for Ax = 0")
    printf("Solution uses %d columns from matrix A \n", i)
    disp(B)
    break
    endif
end