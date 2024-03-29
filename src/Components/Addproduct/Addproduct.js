import React, { useEffect, useState } from "react";
import useFirestore from "../../Components/hooks/useFirestore";
import $ from "jquery";

import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  where,
  setDoc,
} from "firebase/firestore";

import { firedb } from "../../firebase";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../../firebase";
import { v4 } from "uuid";
import "./Add_Pro_style.css";

const AddProduct = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [productName, setProductName] = useState("");
  const [productPrice_raw, setProductPrice_raw] = useState(0);
  const [productPrice_chop, setProductPrice_chop] = useState(0);
  const [productPrice_Deal, setProductPrice_Deal] = useState(0);
  const [item_grandtotal, set_item_grandTotal] = useState(0);
  const [Category, setCategory] = useState("de");
  const [Product_type, set_type] = useState("");
  const [tasks, setTasks] = useState([]);
  const [Order, setOrder] = useState([]);
  const [idd, setid] = useState("");

  let abc = [];

  const imagesListRef = ref(storage, "images/");

  const uploadFile = () => {
    const myCollectionRef = collection(firedb, Category);
    const q = query(myCollectionRef, where("ProductName", "==", productName));

    if (imageUpload == null) return;

    const imageRef = ref(storage, `images/fruits/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [...prev, url]);

        if (Category == "deals") {
          getDocs(q).then((querySnapshot) => {
            if (querySnapshot.size === 0) {
              // no matching documents found, insert the new data
              addDoc(myCollectionRef, {
                ProductName: productName,
                productPrice_Deal: Number(productPrice_Deal),
                ProductImg: url,
                Product_Type: Product_type,
              }).then(() => {
                console.log("Data inserted successfully!");
              });
            } else {
              // matching documents found, do not insert the new data
              window.alert("Product already exists With Same Name!");
            }
          });
        } else {
          getDocs(q).then((querySnapshot) => {
            if (querySnapshot.size === 0) {
              // no matching documents found, insert the new data
              addDoc(myCollectionRef, {
                ProductName: productName,
                ProductPrice_Raw: Number(productPrice_raw),
                ProductPrice_Chop: Number(productPrice_chop),
                Product_Type: Product_type,
                ProductImg: url,
              }).then(() => {
                console.log("Data inserted successfully!");
              });
            } else {
              // matching documents found, do not insert the new data
              window.alert("Product already exists With Same Name!");
            }
          });
        }
      });
    });
  };

  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  });

  const handleDelete = async () => {
    const taskDocRef = doc(firedb, Category, idd);
    try {
      await deleteDoc(taskDocRef);
    } catch (err) {
      alert(err);
    }
  };

  const Reject = (e) => {
    const docRef = doc(firedb, "Order", e);

    const data = {
      Status: "Reject",
    };

    setDoc(docRef, data, { merge: true })
      .then((docRef) => {
        console.log("Order Has Rejected");
      })
      .catch((error) => {
        alert(error);
      });
  };

  const Recived_Order = (e) => {
    const docRef = doc(firedb, "Order", e);

    const data = {
      Status: "Recived",
    };

    setDoc(docRef, data, { merge: true })
      .then((docRef) => {
        console.log("Order Has Confirm");
      })
      .catch((error) => {
        alert(error);
      });
  };

  const Confirm_Order = (e) => {
    const docRef = doc(firedb, "Order", e);

    const data = {
      Status: "Confirm",
    };

    setDoc(docRef, data, { merge: true })
      .then((docRef) => {
        alert("Order Has Confirm");
      })
      .catch((error) => {
        alert(error);
      });
  };

  const Deliver_Order = (e) => {
    const docRef = doc(firedb, "Order", e);

    const data = {
      Status: "Deliver",
    };

    setDoc(docRef, data, { merge: true })
      .then((docRef) => {
        alert("Order Has Deliver");
      })
      .catch((error) => {
        alert(error);
      });
  };

  function chos() {
    let a = document.getElementById("chose_category").value;
    setCategory(a);
    alert(Category);
  }

  function details_Show() {
    $(".details").toggle();
  }

  useEffect(() => {
    const q = query(collection(firedb, Category));
    onSnapshot(q, (querySnapshot) => {
      setTasks(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
          Status: doc.data().Status,
        }))
      );
    });

    if (Category == "deals") {
      document.getElementById("Price_section_deal").style.display = "block";
      document.getElementById("Price_section").style.display = "None";
    } else {
      document.getElementById("Price_section_deal").style.display = "None";
      document.getElementById("Price_section").style.display = "block";
    }
  }, [Category]);

  useEffect(() => {
    const Order_Query = query(collection(firedb, "Order"));
    onSnapshot(Order_Query, (querySnapshot) => {
      setOrder(
        querySnapshot.docs.map((doc) => ({
          Order_id: doc.id,
          Order_data: doc.data(),
          Status: doc.data().Status,
        }))
      );
    });
  }, []);

  useEffect(() => {
    for (let i = 0; i < Order.length; i++) {
      if (Order[i].Status == "Recived") {
        document.getElementById(Order[i].Order_id).style.backgroundColor =
          "rgb(105, 225, 89)";
      } else if (Order[i].Status == "Pending") {
        document.getElementById(Order[i].Order_id).style.backgroundColor =
          "rgb(243, 106, 106)";
      } else if (Order[i].Status == "Deliver") {
        document.getElementById(Order[i].Order_id).style.backgroundColor =
          "rgb(103, 203, 233)";
      }
    }
  }, [Order]);

  return (
    <div className="admin_wrapper">
      <div className="row nav_row_admin">
        <div className="col-3">
          <h1>Admin Panel</h1>
        </div>
        <div className="col-9 Admin_ul">
          <ul>
            <a href="#pg1">
              <li>Add Product</li>
            </a>

            <a href="#pg2">
              <li>Recive Order</li>
            </a>

            <a href="#pg3">
              <li>Deliver Order</li>
            </a>
            <a href="#pg4">
              <li>Order History</li>
            </a>
          </ul>
        </div>
      </div>

      <div className="row Add_pd_col" id="pg1">
        <div className="col-3">
        <div className="col-12">
          <label>Category:</label>
          <select
            onClick={(e) => {
              setCategory(e.target.value);
            }}
          >
            <option value="Fruits">Fruits</option>
            <option value="Vegitable">Vegitable</option>
            <option value="deals">deals</option>
          </select>
        </div>

        <div className="col-12">
          <input
            placeholder="Product-Name"
            type="text"
            require
            onChange={(e) => setProductName(e.target.value)}
            value={productName}
          />
        </div>

        <div className="col-12">
        <select
            onClick={(e) => {
              set_type(e.target.value);
            }}
          >
            <option selected="selected" disabled="disabled">
              SELECT TYPE
            </option>
            <option>Both</option>
            <option>Raw</option>
          </select>
        </div>

        <div className="col-12" id="Price_section">
          <label htmlFor="product-price">Raw Price</label>

          <input
            type={"number"}
            required
            onChange={(e) => setProductPrice_raw(e.target.value)}
            value={productPrice_raw}
            min="0"
          />

          <label htmlFor="product-price">Chop Price</label>

          <input
            type="number"
            required
            onChange={(e) => setProductPrice_chop(e.target.value)}
            value={productPrice_chop}
            min="0"
          />

   
        </div>

        <div className="col-12" id="Price_section_deal">
          <label htmlFor="product-price">Deal Price</label>

          <input
            type={"number"}
            required
            onChange={(e) => setProductPrice_Deal(e.target.value)}
            value={productPrice_Deal}
            min="0"
          />
        </div>

        <div className="col-12">
          <label htmlFor="product-img">Product Image</label>
          <button
            type="Button"
            onClick={() => {
              document.getElementById("brows").click();
            }}
            id="Img_bt_add"
          >
            Select Img
          </button>
          <input
            type="file"
            placeholder="Insert Image"
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
            id="brows"
          />
        </div>

        <div className="col-12">
         
         <img src={imageUrls} width="70%" height="50%"></img>
 
        </div>


        <div className="col-12">
          <button onClick={uploadFile} id="bb" type="button">
            {" "}
            Add Product
          </button>
        </div>

        {/* <img src={imageUrls}></img> */}
      </div>
      

      <div className="col-9 Product_screen">
          <div className="row">
            <h1>Active Products</h1>
          </div>

          {tasks &&
            tasks.map((doc) => (
              <div className="admin_item_card">
                <img
                  src={doc.data.ProductImg}
                  style={{
                    width: "10rem",
                    height: "10rem",
                    marginLeft: "4rem",
                    marginTop: "1rem",
                  }}
                />

                <p>Name: {doc.data.ProductName}</p>
                <p>Raw/Price: {doc.data.ProductPrice_Raw}</p>
                <p>Chop/Price: {doc.data.ProductPrice_Chop}</p>
                <p>Deal/Price: {doc.data.productPrice_Deal}</p>
                <p>
                  <sub>ID: {doc.id}</sub>
                </p>

                <button
                  id="del"
                  onMouseEnter={(e) => {
                    setid(doc.id);
                  }}
                  onClick={handleDelete}
                >
                  Remove
                </button>
              </div>
            ))}{" "}
        </div>

      </div>



      {/* ===========================================================Order Page Start ================================ */}

      <div className="row Order_row" id="pg2">
        {/* <div className="Header_order" style={{ backgroundColor: "orange" }} >


                    <p style={{ padding: "0rem 10rem 0rem 10rem" }}>ID:</p>
                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Name</p>
                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Phone#</p>

                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Address:</p>

                    <p>Location:</p>



                </div> */}
        {Order &&
          Order.map((doc) => {
            if (doc.Status == "Pending" || doc.Status == "Recived") {
              return (
                <div className="Order_List" id={doc.Order_id}>
                  <p
                    id="O_l_p"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {doc.Order_id}{" "}
                  </p>
                  <p id="O_l_p">{doc.Order_data.Person}</p>
                  <p id="O_l_p">{doc.Order_data.Phone}</p>

                  <p id="O_l_p">{doc.Order_data.Address}</p>

                  <p id="O_l_p">
                    {doc.Order_data.Location}: {doc.Order_data.City}{" "}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      $("#" + doc.Order_id + "inner_details").toggle();
                    }}
                    id="Admin_bt"
                  >
                    Show_Details
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      Recived_Order(doc.Order_id);
                    }}
                    id="Admin_bt"
                  >
                    Recived
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      Confirm_Order(doc.Order_id);
                    }}
                    id="Admin_bt"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      Reject(doc.Order_id);
                    }}
                    id="Admin_bt"
                  >
                    Reject
                  </button>

                  <div
                    className="row details"
                    id={doc.Order_id + "inner_details"}
                  >
                    {doc.Order_data.Items &&
                      doc.Order_data.Items.map((e) => {
                        return (
                          <div className="row item_details_admin">
                            <div className="col-2">{e.id}</div>

                            <div className="col-2">{e.data.Name}</div>

                            <div className="col-2">{e.data.Type}</div>

                            <div className="col-1">{e.data.Price}</div>

                            <div className="col-1">{e.data.Quantity}</div>

                            <div className="col-3">
                              {e.data.Quantity * e.data.Price}
                            </div>
                          </div>
                        );
                      })}
                    <div
                      className="col-12"
                      style={{
                        fontSize: "2rem",
                        paddingLeft: "75%",
                        boxSizing: "border-box",
                      }}
                    >
                      {"Total : " + doc.Order_data.Grand_Total}{" "}
                    </div>
                  </div>
                </div>
              );
            }
          })}{" "}
      </div>

      {/* ================================================= Page 3 =============================== */}

      <div className="row Order_row" id="pg3">
        {/* <div className="Header_order" style={{ backgroundColor: "orange" }} >


                    <p style={{ padding: "0rem 10rem 0rem 10rem" }}>ID:</p>
                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Name</p>
                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Phone#</p>

                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Address:</p>

                    <p>Location:</p>



                </div> */}
        {Order &&
          Order.map((doc) => {
            if (doc.Status == "Confirm") {
              return (
                <div
                  className="Order_List"
                  style={{ backgroundColor: "lightpink" }}
                  id={doc.Order_id}
                >
                  <p
                    id="O_l_p"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {doc.Order_id}{" "}
                  </p>
                  <p id="O_l_p">{doc.Order_data.Person}</p>
                  <p id="O_l_p">{doc.Order_data.Phone}</p>

                  <p id="O_l_p">{doc.Order_data.Address}</p>

                  <p id="O_l_p">
                    {doc.Order_data.Location}: {doc.Order_data.City}{" "}
                  </p>

                  <button
                    type="button"
                    style={{ fontSize: "2rem" }}
                    onClick={() => {
                      Deliver_Order(doc.Order_id);
                    }}
                    id={doc.Order_id}
                  >
                    Deliver
                  </button>
                </div>
              );
            }
          })}{" "}
      </div>

      {/* ==================================================== page 4 ================================ */}

      <div className="row Order_row" id="pg4">
        {/* <div className="Header_order" style={{ backgroundColor: "orange" }} >


                    <p style={{ padding: "0rem 10rem 0rem 10rem" }}>ID:</p>
                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Name</p>
                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Phone#</p>

                    <p style={{ padding: "0rem 6rem 0rem 6rem" }}>Address:</p>

                    <p>Location:</p>



                </div> */}
        {Order &&
          Order.map((doc) => {
            if (doc.Status == "Deliver") {
              return (
                <div className="Order_List" id={doc.Order_id}>
                  <p
                    id="O_l_p"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {doc.Order_id}{" "}
                  </p>
                  <p id="O_l_p">{doc.Order_data.Person}</p>
                  <p id="O_l_p">{doc.Order_data.Phone}</p>

                  <p id="O_l_p">{doc.Order_data.Address}</p>

                  <p id="O_l_p">
                    {doc.Order_data.Location}: {doc.Order_data.City}{" "}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      $("#" + doc.Order_id + "inner_details").toggle();
                    }}
                    id="Admin_bt"
                  >
                    Show_Details
                  </button>

                  <div
                    className="row details"
                    id={doc.Order_id + "inner_details"}
                  >
                    {doc.Order_data.Items &&
                      doc.Order_data.Items.map((e) => {
                        return (
                          <div className="row item_details_admin">
                            <div className="col-2">{e.id}</div>

                            <div className="col-2">{e.data.Name}</div>

                            <div className="col-2">{e.data.Type}</div>

                            <div className="col-1">{e.data.Price}</div>

                            <div className="col-1">{e.data.Quantity}</div>

                            <div className="col-3">
                              {e.data.Quantity * e.data.Price}
                            </div>
                          </div>
                        );
                      })}
                    <div
                      className="col-12"
                      style={{
                        fontSize: "2rem",
                        paddingLeft: "75%",
                        boxSizing: "border-box",
                      }}
                    >
                      {"Total : " + doc.Order_data.Grand_Total}{" "}
                    </div>
                  </div>
                </div>
              );
            }
          })}{" "}
      </div>
    </div>
  );
};

export default AddProduct;
