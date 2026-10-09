'use client';

type Props={
  open:boolean;
  title:string;
  message:string;
  confirmText?:string;
  cancelText?:string;
  danger?:boolean;
  infoOnly?:boolean;
  busy?:boolean;
  onConfirm:()=>void|Promise<void>;
  onCancel:()=>void;
};

export default function ConfirmDialog({
  open,title,message,confirmText='Ya, Lanjutkan',cancelText='Batal',danger=false,infoOnly=false,busy=false,onConfirm,onCancel
}:Props){
  if(!open)return null;
  return <div className="modalBack confirmModalBack" onMouseDown={busy?undefined:onCancel}>
    <div className="modal3d confirmModal3d" onMouseDown={e=>e.stopPropagation()}>
      <div className={`confirmIcon ${danger?'danger':''}`}>{danger?'!':'✓'}</div>
      <h2>{title}</h2>
      <p className="muted confirmMessage">{message}</p>
      <div className="actions confirmActions">
        {!infoOnly&&<button type="button" className="btn alt" disabled={busy} onClick={onCancel}>{cancelText}</button>}
        <button type="button" className={danger?'btn dangerBtn':'btn'} disabled={busy} onClick={()=>onConfirm()}>
          {busy?'Memproses...':(infoOnly?'OK':confirmText)}
        </button>
      </div>
    </div>
  </div>
}
