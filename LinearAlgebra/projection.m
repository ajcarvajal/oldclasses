function [proj] = projection(y, span)
  
  m = columns(span);
  proj = zeros(size(span),1);
  
  for i=1:m
      u = span(:,i);
      proj = proj + ((y' * u) / (u' * u)) * u;
  end
  
end
