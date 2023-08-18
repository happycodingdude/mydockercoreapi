import { Button } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../../assets/Button.css';
import '../../assets/FlexBox.css';
import CustomModal from '../../components/CustomModal.js';
import NavBar from '../../components/NavBar.js';
import usePagingView from '../../hooks/usePagingView.js';

const Location = ({ token }) => {
  const navigate = useNavigate();

  // State list location
  const [locations, setLocations] = useState([]);

  // Get all data first render
  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get('api/location',
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          setLocations(res.data.data);
          setCurrentPage(1);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }, []);

  // State object to save
  const [saveObject, setSaveObject] = useState({});
  // State item to edit
  const [editId, setEditId] = useState(0);
  useEffect(() => {
    if (editId === 0) return;

    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get(`api/location/${editId}`,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          setSaveObject(res.data.data);
          handleShowModal(res.data.data);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }, [editId]);

  // State location data to open modal
  const [formParam, setFormParam] = useState({});
  // Prepare param and show modal
  const handleShowModal = (data) => {
    let formParam = {
      formAction: data === undefined ? 'add' : 'edit',
      formId: editId,
      formData: [
        {
          ItemName: 'Name',
          ItemValue: data === undefined ? '' : data['Name'],
          ItemType: 'input'
        },
        {
          ItemName: 'Address',
          ItemValue: data === undefined ? '' : data['Address'],
          ItemType: 'input'
        },
        {
          ItemName: 'Images',
          ItemValue: "https://lab.connect247.vn/konglab/resource/files/1229b2ab-93c2-427a-88f3-b737fafaca93/webchat/bfd6a0eafa7d4f399278b128c3e70b4d1808202394413.jpg",
          ItemType: 'image'
        }
      ],
    }
    setFormParam(formParam);
    handleShow();
  }

  // Control show/hide modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Open modal
  const handleOpenForm = (id) => {
    if (id === undefined) {
      setSaveObject({});
      handleShowModal();
      setEditId(0);
    } else {
      setEditId(prev => {
        if (id !== prev) {
          return id;
        }
        handleShowModal(saveObject);
        return prev;
      });
    }
  }

  // Add or edit
  const handleSaveChanges = (action) => {
    if (action === 'add')
      handleAdd();
    else
      handleEdit(editId);
  }
  // Add
  const handleAdd = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const body = JSON.stringify(saveObject);
    axios.post(`api/location`,
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          handleClose();
          setLocations([...locations.slice(0, 0), res.data.data, ...locations.slice(0)]);
        }
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }
  // Edit
  const handleEdit = (id) => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const body = JSON.stringify(saveObject);
    axios.put(`api/location`,
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          handleClose();
          const updated = locations.map((item) => {
            if (item.Id === id)
              // Update the value for the specific item
              return res.data.data;
            return item;
          });
          // Update the state with the new table data
          setLocations(updated);
        }
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }
  // Delete
  const handleDelete = (id) => {
    if (window.confirm('Delete this item?') == true) {
      const cancelToken = axios.CancelToken.source();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      };
      axios.delete(`api/location/${id}`,
        { cancelToken: cancelToken.token, headers: headers })
        .then(res => {
          if (res.status === 200) {
            setLocations(locations.filter((item) => item.Id !== id));
          }
        })
        .catch(err => {
          console.log(err);
          if (err.response?.status === 401) navigate('/');
        });

      return () => {
        cancelToken.cancel();
      }
    }
  }

  // State paging
  const [pagingData, setPagingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Controll pagination
  const { pagingView, paging } = usePagingView();
  useEffect(() => {
    paging(locations, currentPage);
    setPagingData(pagingView.current);
  }, [currentPage, locations]);

  return (
    <div className='container'>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <Button type='primary' onClick={() => handleOpenForm()}>Add</Button>
      <div className='row'>
        <div className='col-md-12'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                pagingData.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.Name}</td>
                    <td>{item.Address}</td>
                    <td colSpan={2}>
                      {
                        <>
                          <Button type='primary' onClick={() => handleOpenForm(item.Id)}>Edit</Button>
                          <Button type='primary' danger onClick={() => handleDelete(item.Id)}>Delete</Button>
                        </>
                      }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <NavBar
            data={locations}
            triggerView={setCurrentPage}
          />
          <CustomModal
            show={show}
            formParam={formParam}
            handleClose={handleClose}
            setSaveObject={setSaveObject}
            handleSaveChanges={handleSaveChanges}
          />
        </div>
      </div>
    </div>
  )
}

export default Location;