using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class BaseRepository<T> : IRepository<T> where T : class
    {
        protected readonly IConfiguration _configuration;
        private readonly CoreContext _context;


        public BaseRepository(CoreContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public virtual async Task<List<T>> GetAll(string[]? includes = null, List<PagingParam>? conditions = null)
        {
            IQueryable<T> query = _context.Set<T>().AsNoTracking();

            if (includes != null)
                foreach (var include in includes)
                    query = query.Include(include);
            if (conditions != null)
            {
                Expression<Func<T, bool>>? combinedExpression = null;
                var parameter = Expression.Parameter(typeof(T));
                foreach (var condition in conditions)
                {
                    var expression =
                    Expression.Lambda<Func<T, bool>>(
                        Expression.Equal(
                            Expression.Property(parameter, condition.field_name),
                            Expression.Constant(condition.field_value, condition.field_type)
                        ),
                        parameter
                    );

                    if (combinedExpression == null)
                    {
                        combinedExpression = expression;
                    }
                    else
                    {
                        var conditionBody = new ExpressionReplacer(parameter, combinedExpression.Parameters[0]).Visit(expression.Body);
                        var combinedBody = Expression.AndAlso(combinedExpression.Body, conditionBody);
                        combinedExpression = Expression.Lambda<Func<T, bool>>(combinedBody, parameter);
                    }
                }
                query = query.Where(combinedExpression);
            }

            return await query.ToListAsync();
        }

        public virtual async Task<T> GetById(int id, string[]? includes = null, bool isCollection = false)
        {
            var current = await _context.Set<T>().FindAsync(id);

            if (includes != null)
                foreach (var include in includes)
                    if (isCollection)
                        _context.Entry(current).Collection(include).Load();
                    else
                        _context.Entry(current).Reference(include).Load();

            _context.Entry(current).State = EntityState.Detached;
            return current;
        }

        public virtual async Task<T> Add(T entity)
        {
            _context.Set<T>().Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T> Update(T entity)
        {
            _context.Set<T>().Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<bool> Delete(int id)
        {
            var current = await GetById(id);
            if (current != null)
            {
                _context.Set<T>().Remove(current);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }
}