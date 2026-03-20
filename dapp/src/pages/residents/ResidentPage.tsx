import { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Sidedar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import { addResident, getResident, isManager, Profile, setCounselor, type Resident } from "../../services/Web3Service";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import { ethers } from "ethers";
import { addApiResident, getApiResident, updateApiResident, type ApiResident } from "../../services/ApiService";
function ResidentPage() {

    const navigate = useNavigate();
    const [message, setMessage] = useState<string>("");
    const [resident, setResident] = useState<Resident>({

    } as Resident);
    const [apiResident, setApiResident] = useState<ApiResident>({} as ApiResident);


    const [isLoading, setIsLoading] = useState<number>(0);

    let { wallet } = useParams();

    useEffect(() => {

        if (wallet) {
            setIsLoading(2);
            getResident(wallet).then(result => {
                setResident(result);
                setIsLoading(prevState => prevState - 1);
            }).catch(err => {
                setMessage(err.message);
                setIsLoading(0);
            });

            getApiResident(wallet).then(result => {
                setApiResident(result);
                setIsLoading(prevState => prevState - 1);
            }).catch(err => {
                setMessage(err.message);
                setIsLoading(0);
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

                return {
                    ...prevState,
                    [id]: parsedValue,
                    wallet: prevState.wallet,
                    residence: prevState.residence
                };
            }
            return {
                ...prevState,
                [id]: value
            }
        });
    }


    function onApiResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {

        const { id, value } = evt.target;

        setApiResident(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    function btnSaveClick() {

        if (resident) {
            setMessage("Connection to wallet...wait...");
            if (!wallet) {
                const promiseBlockchain = addResident(resident.wallet, resident.residence);
                const promiseBackend = addApiResident({ ...apiResident, profile: Profile.RESIDENT, wallet: resident.wallet });

                Promise.all([promiseBlockchain, promiseBackend])
                    .then(([txBlockchain, _]) => {
                        navigate("/residents?tx=" + txBlockchain.hash);
                    }).catch(err => {
                        setMessage(err.message);
                    });
            } else {
                const profile = resident.isCounselor ? Profile.COUNSELOUR : Profile.RESIDENT;
                const promises = [];

                if (apiResident.profile != profile) {
                    promises.push(setCounselor(resident.wallet, resident.isCounselor));
                }

                promises.push(updateApiResident(resident.wallet, { ...apiResident, profile: profile, wallet: wallet }));

                Promise.all(promises).then(() => {

                    navigate("/residents?tx=" + wallet);
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
                                            <i className="material-icons opacity-10 me-2">group</i> {wallet ? <span>Edit Resident</span> : <span>New Resident</span>}</h6>
                                    </div>
                                </div>
                                <div className="card-body px-0 pb-2">
                                    {
                                        isLoading > 0 && <Loader />
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

                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3" >
                                            <div className="form-group">
                                                <label htmlFor="name" >Name:</label>
                                                <div className="input-group input-group-outline">
                                                    <input className="form-control" type="text" id="name" value={apiResident.name || ""} onChange={onApiResidentChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3" >
                                            <div className="form-group">
                                                <label htmlFor="phone" >Phone:</label>
                                                <div className="input-group input-group-outline">
                                                    <input className="form-control" type="tel" id="phone" value={apiResident.phone || ""} placeholder="+551199999-9999" onChange={onApiResidentChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3" >
                                            <div className="form-group">
                                                <label htmlFor="email" >Email:</label>
                                                <div className="input-group input-group-outline">
                                                    <input className="form-control" type="email" id="email" value={apiResident.email || ""} placeholder="example@email.com" onChange={onApiResidentChange} />
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