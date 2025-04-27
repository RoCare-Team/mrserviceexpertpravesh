"use client"
import React, { useEffect, useState } from "react";
// import ExtraOptions from "../modals/extraOptions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import PhoneVerification from "../PhoneVerification/PhoneVerification";
import { toast, ToastContainer } from "react-toastify";
// import {  useParams } from "react-router-dom";
import { useParams } from "next/navigation";

const ServicesList = ({ addedServices = [], state }) => {
//   const location = useLocation();

  const { city, cat} = useParams(); 
  

  const [catNam,setCatNam]=useState("");
  const [servicedata,setServiceData]=useState([]);
  const [catergoryTitle,setCatergoryTitle]=useState("");
  const [BrandName,setBrandName]=useState("");
  // const { city, cat } = useParams();

// console.log(cat +"-"  );

// console.log(BrandName);


  // Define which categories should use the modal
  const modalCategories = ['ac', 'refrigerator', 'chimney', 'washing-machine', 'water-purifier'];
  const [showModal, setShowModal] = useState(false);

  const type = localStorage.setItem('type', 'add');
 
  
 
useEffect(()=>{
  let lead_type = null;

//   const cat=category;

  if (cat === "washing-machine-repair" ||city === "washing-machine-repair") {
    lead_type = 4;
  } else if (cat === "ac" || city === "ac") {
    lead_type = 2;
  } else if (cat === "ro-water-purifier" ||city === "ro-water-purifier") {
    lead_type = 1;
  }else if (cat === "microwav-repair" ||city === "microwav-repair") {
    lead_type = 9;
  }else if (cat === "vacuum-cleaner-repair" ||city === "vacuum-cleaner-repair") {
    lead_type = 11;
  }else if (cat === "geyser-repair" ||city === "geyser-repair") {
    lead_type = 5;
  }else if (cat === "kitchen-chimney-repair" ||city === "kitchen-chimney-repair") {
    lead_type = 10;
  }else if (cat === "refrigerator-repair" ||city === "refrigerator-repair") {
    lead_type = 6;
  }

  

  const cid = localStorage.getItem('customer_id');
  
  fetch('https://waterpurifierservicecenter.in/customer/ro_customer/all_services.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({cid:cid,lead_type:lead_type})

})
.then(res => res.json())
.then(data => {
console.log("Service Response:", data);
// console.log(data.Title);

setServiceData(data.service_details);
setCatergoryTitle(data.Title);
setBrandName(cat);

},[])


  
},[cat])



// console.log(servicedata);









  const handleAddToCart = async (service) => {
    if (!addedServices.includes(service.id)) {
      // onAddToCart(service); 
      const service_id = service.id;
      const quantity = 1;
      console.log(quantity);
      
      const type = localStorage.getItem('type');
      const cid = localStorage.getItem('customer_id');
      console.log(cid);
      if (cid != null) {
        toast.success('Hope You Enjoy Our Services 🎉');
        const payload = { service_id, quantity, cid, type };
        const res = await fetch("https://waterpurifierservicecenter.in/customer/ro_customer/add_to_cart.php", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        localStorage.setItem('checkoutState', JSON.stringify(data.AllCartDetails == null ? []: data.AllCartDetails));
      localStorage.setItem('cart_total_price',data.total_price== null ? 0 : data.total_price);

           // Update the addedServices array after successful API call
      // setAddedServices(prev => [...prev, service.id]);
      } else {
        setShowModal(true);
        // toast.error('Login before addding any service');

        // setTimeout(() => {
        //   setShowModal(true);
        // }, 1500)

      }

    }
  };

  return (
    <div className="services-list">
      {/* <ToastContainer /> */}
      <h3 className="mt-3 ml-4"><b>{catergoryTitle}</b></h3>
      {servicedata?.map((service) => {
              const isAdded = addedServices.includes(service.id);
              // Fix: Define useModal variable here
              const useModal = modalCategories.includes(service.category);

              return (
                
                <div key={service.id} className="common-service-style">
                   
                  <div className="servicePortionDetails flex-col" >
                  <div className="flex serviceWiseContainer">
                    <div className="serviceDetails">

                      <h3 className="serviceVarities">{service.service_name}</h3>
                      <div>
                        <span className="serviceReview">
                          <FontAwesomeIcon icon={faStar} /> {service.rating} ({service.reviews} reviews)
                        </span>
                        <div className="dashedLine"></div>
                        <div className="prices flex gap-2.5">
                          <span>
                            ₹{service?.price}
                          </span>

                          {/* removed this cause it was making it string {service?.price + 100 } */}
                          <span className="actualPrice">₹{Number(service?.price) + 100}</span>
                        </div>
                      </div>
                    </div>
                    <div className="serviceImgContainer">
                     
                        <div className="serviceDetailsImg mb-0.5">
                          <img src={service.image} alt={service.name} />
                        </div>
                     
                      <div className=" ">
                         
                          <button
                            className={`add-to-cart-btn ${isAdded ? "bg-violet-300 px-2 py-1.5 cursor-not-allowed" : "IncrementDcrementBtn2"} rounded`}
                            onClick={() => handleAddToCart(service)}
                            disabled={isAdded}
                          >
                            {isAdded ? "Added" : "Add"}
                        </button>
                        
                      </div>
                    </div>
                  </div>
                   <div className="briefInfo2 w-full"  dangerouslySetInnerHTML={{ __html: service.description}}></div>
                </div>
                </div>
              );
            })}
      <PhoneVerification setShowModal={setShowModal} showModal={showModal} />

    </div>
  );
};

export default ServicesList;