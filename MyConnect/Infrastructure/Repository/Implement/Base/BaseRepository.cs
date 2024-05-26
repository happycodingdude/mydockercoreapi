namespace Infrastructure.Repository;

public class BaseRepository<T> : IRepository<T> where T : BaseModel
{
    protected readonly CoreContext _context;
    public DbSet<T> DbSet { get; private set; }

    public BaseRepository(CoreContext context)
    {
        _context = context;
        _context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        DbSet = _context.Set<T>();
    }

    public virtual IEnumerable<T> GetAll()
    {
        return DbSet.ToList();
    }

    public virtual IEnumerable<T> GetAll(int page, int limit)
    {
        return DbSet.OrderByDescending(q => q.CreatedTime).Skip(limit * (page - 1)).Take(limit).ToList();
    }

    public virtual T GetById(Guid id)
    {
        return DbSet.Find(id);
    }

    public virtual void Add(T entity)
    {
        DbSet.Add(entity);
    }

    public virtual void Add(List<T> entities)
    {
        DbSet.AddRange(entities);
    }

    public virtual void Update(T entity)
    {
        entity.BeforeUpdate();
        DbSet.Entry(entity).State = EntityState.Modified;
        DbSet.Entry(entity).Property(q => q.CreatedTime).IsModified = false;
        // DbSet.Update(entity);
        // _context.Entry(entity).State = EntityState.Modified;
        // _context.Entry(entity).Property(q => q.CreatedTime).IsModified = false;
    }

    public virtual void Update(List<T> entity)
    {
        foreach (var item in entity)
        {
            item.BeforeUpdate();
            DbSet.Entry(item).State = EntityState.Modified;
            DbSet.Entry(item).Property(q => q.CreatedTime).IsModified = false;
        }
    }

    public virtual void Delete(Guid id)
    {
        var entity = _context.Set<T>().Find(id);
        DbSet.Remove(entity);
    }

    public virtual void Delete(List<T> entities)
    {
        DbSet.RemoveRange(entities);
    }

    private bool disposed = false;

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
        }
        disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}