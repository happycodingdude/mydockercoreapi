import { Button } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import CustomModal from '../../components/CustomModal.js';
import NavBar from '../../components/NavBar.js';
import usePagingView from '../../hooks/usePagingView.js';

const Participant = ({ token }) => {
  const navigate = useNavigate();

  // State list participant
  const [participants, setParticipants] = useState([]);

  // Get all data first render
  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get('api/participant',
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          setParticipants(res.data.data);
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
    axios.get(`api/participant/${editId}`,
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

  // State participant data to open modal
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
    axios.post(`api/participant`,
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          handleClose();
          setParticipants([...participants.slice(0, 0), res.data.data, ...participants.slice(0)]);
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
    axios.put(`api/participant`,
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          handleClose();
          const updated = participants.map((item) => {
            if (item.Id === id)
              // Update the value for the specific item
              return res.data.data;
            return item;
          });
          // Update the state with the new table data
          setParticipants(updated);
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
      axios.delete(`api/participant/${id}`,
        { cancelToken: cancelToken.token, headers: headers })
        .then(res => {
          if (res.status === 200) {
            setParticipants(participants.filter((item) => item.Id !== id));
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
    paging(participants, currentPage);
    setPagingData(pagingView.current);
  }, [currentPage, participants]);

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
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                pagingData.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.Name}</td>
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
            data={participants}
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

export default Participant;