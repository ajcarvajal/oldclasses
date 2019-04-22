disp("----Question 41----\n")

C = rand(4);

disp("Finding eig values/vectors for C\n")
[V, lambda] = eig(C)

disp("Finding eig values/vectors for C' \n")
[V, lambda] = eig(C')

disp("We can see here that C and C' have the same deterministic polynomials")
disp("because their eigenvalues are the same\n")
disp("The eigenvectors however, are different.\n")

D = rand(5);
[V, lambda] = eig(D);
[V, lambda] = eig(D');

disp("The same was true for the random 5x5 matrix\n")
