import { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Sidedar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import { addResident, doLogout, getResident, isManager, isResident, setCounselor, type Resident } from "../../services/Web3Service";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import { ethers } from "ethers";

function ResidentPage() {

    const navigate = useNavigate();
    const [message, setMessage] = useState<string>("");
    const [resident, setResident] = useState<Resident>({} as Resident);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let { wallet } = useParams();

    useEffect(() => {
        if (isResident()) {
            doLogout();
            navigate("/");
        }
        if (wallet) {
            setIsLoading(true);
            getResident(wallet).then(result => {
                setResident(result);
                setIsLoading(false);
            }).catch(err => {
                setMessage(err.message);
                setIsLoading(false);
            });
        }


    }, [wallet]);




    function onResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {

        const { id, value, type, checked } = evt.target;

        setResident(prevState => {
            let parsedValue: string | boolean = value;

            if (id === "isCounselor") {
                // Se for checkbox, usa checked
                parsedValue = type === "checkbox" ? checked : value === "true";
            }

            return {
                ...prevState,
                [id]: parsedValue,
                wallet: prevState.wallet ?? "",
                residence: prevState.residence ?? ""
            };
        });
    }


    function btnSaveClick() {

        if (resident) {
            setMessage("Connection to wallet...wait...");
            if (!wallet) {
                addResident(resident.wallet, resident.residence).then(tx => {
                    navigate("/residents?tx=" + tx.hash);
                }).catch(err => {
                    setMessage(err.message);
                });
            } else {
                setCounselor(resident.wallet, resident.isCounselor).then(tx => {
                    navigate("/residents?tx=" + tx.hash);
                }).catch(err => {
                    setMessage(err.message);
                });
            }
        }
    }

    function getNextPayment() {
        const dateMs = Number(resident.nextPayment) * 1000;

        if (!dateMs) return "Never Payed";

        return new Date(dateMs).toDateString();

    }
    function getNextPaymentClass() {
        let className = "input-group input-group-outline ";
        if (!resident.nextPayment) return className + "is-invalid";

        const dateMs = ethers.toNumber(resident.nextPayment) * 1000;
        if (!dateMs || dateMs < Date.now()) return className + "is-invalid";

        return className + "is-valid";
    }

    return (
        <>
            <Sidedar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">

                <div className="container-fluid py-4">
                    <div className="row">
                        <div className="col-12">
                            <div className="card my-4">
                                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                    <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                                        <h6 className="text-white text-capitalize ps-3">
                                            <i className="material-icons opacity-10 me-2">group</i>New Resident</h6>
                                    </div>
                                </div>
                                <div className="card-body px-0 pb-2">
                                    {
                                        isLoading && <Loader />
                                    }

                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3" >
                                            <div className="form-group">
                                                <label htmlFor="wallet" >Wallet Address:</label>
                                                <div className="input-group input-group-outline">
                                                    <input className="form-control" type="text" id="wallet" placeholder="0x00.." value={resident.wallet || ""} onChange={onResidentChange} disabled={!!wallet} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3" >
                                            <div className="form-group">
                                                <label htmlFor="residence" >Residence Id (block+apartment):</label>
                                                <div className="input-group input-group-outline">
                                                    <input className="form-control" type="number" id="residence" value={resident.residence || ""} placeholder="2102" onChange={onResidentChange} disabled={!!wallet} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {
                                        wallet &&
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3" >
                                                <div className="form-group">
                                                    <label htmlFor="nextPayment" >Next Payment:</label>
                                                    <div className={getNextPaymentClass()}>
                                                        <input className="form-control" type="text" id="nextPayment" value={getNextPayment()} disabled={true}></input>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        isManager() && wallet &&
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3" >
                                                <div className="form-group">
                                                    <SwitchInput id="isCounselor" isChecked={resident.isCounselor} text="Is Counselor?" onChange={onResidentChange} />

                                                </div>
                                            </div>
                                        </div>
                                    }

                                    <div className="row ms-3">
                                        <div className="col-md-12 mb-3">
                                            <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                                <i className="material-icons opacity-10 me-2">save</i> Save Resident
                                            </button>
                                            <span className="text-danger">
                                                {message}
                                            </span>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </div>
            </main>
        </>
    );
}

export default ResidentPage;