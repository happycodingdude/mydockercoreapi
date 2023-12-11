using Microsoft.AspNetCore.Mvc;
using MyConnect.Common;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
// [MyAuthorize("Authorization")]
public class ContactsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ContactsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Contact.GetAll();
            return new ResponseModel<IEnumerable<Contact>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Contact>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Contact.GetById(id);
            return new ResponseModel<Contact>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Contact model)
    {
        try
        {
            model.Password = Hash.Encrypt(model.Password);
            _unitOfWork.Contact.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Contact>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Contact model)
    {
        try
        {
            _unitOfWork.Contact.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Contact>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            _unitOfWork.Contact.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }
}