namespace Shared.Utils;

public static class LinQExtension
{
    public static IQueryable<TEntity> OrderBy<TEntity>(this IQueryable<TEntity> source, string orderByProperty, bool asc)
    {
        string command = asc ? "OrderBy" : "OrderByDescending";
        var type = typeof(TEntity);
        var property = type.GetProperty(orderByProperty);
        var parameter = Expression.Parameter(type, "p");
        var propertyAccess = Expression.MakeMemberAccess(parameter, property);
        var orderByExpression = Expression.Lambda(propertyAccess, parameter);
        var resultExpression = Expression.Call(typeof(Queryable), command, new Type[] { type, property.PropertyType },
                                      source.Expression, Expression.Quote(orderByExpression));
        return source.Provider.CreateQuery<TEntity>(resultExpression);
    }
}
