disp("----Question 40----\n")
clear;

A = [-23 57 -9 -15 -59; -10 12 -10 2 -22; 11 5 -3 -19 -15; -27 31 -27 25 -37; -5 -15 -5 1 31];
B = A;
m = rows(A);
lambda = unique(eig(A))

for i=1:size(lambda)
  basis = ones(m,1);
  for j=1:m
    B(j,j) = A(j,j) - lambda(i);
  end
  printf("Basis for lambda = %d: \n", lambda(i))
  C = rref(B);
  x = 1;
  for k=1:m
    if (C(x,k) != 1)
      basis = [basis C(:,k).*-1];
      basis(k,end) = 1;
      basis = round(basis .* 10000) ./ 10000;
    else
      x = x+1;
    end
  end
  basis(:, 2:end)
end
