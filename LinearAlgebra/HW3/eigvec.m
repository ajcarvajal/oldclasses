function retval = eigvec (A)

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


endfunction
