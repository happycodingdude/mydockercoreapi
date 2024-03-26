using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationsController(INotificationService notificationService, IUnitOfWork unitOfWork)
    {
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get(int page, int limit)
    {
        try
        {
            var response = _unitOfWork.Notification.GetAll(page, limit);
            return new ResponseModel<IEnumerable<Notification>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Notification>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Notification.GetById(id);
            return new ResponseModel<Notification>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Notification model)
    {
        try
        {
            _unitOfWork.Notification.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Notification>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(Notification model)
    {
        try
        {
            _unitOfWork.Notification.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Notification>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Notification.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpPost("register")]
    public IActionResult RegisterToken(RegisterConnection param)
    {
        try
        {
            var response = _notificationService.RegisterConnection(param);
            return new ResponseModel<bool>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<bool>().BadRequest(ex);
        }
    }
}