import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import Pagination from "@mui/material/Pagination"; // Import Pagination của MUI
import Stack from "@mui/material/Stack";
import { Baiviet } from "../../../interfaces/baiviet";
import axios from "axios";

const BaivietPage = () => {
  const [baivietList, setBaivietList] = useState<Baiviet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/baiviet");
        console.log("data.id",data.map((item: Baiviet) => item.id));
        setBaivietList(data);
        // if (data && data.length > 0) {
        //     const activeBaiviets = data
        //         .filter((item: Baiviet) => item.isActive === true)
        //         .sort((a: Baiviet, b: Baiviet) => {
        //             const dateA = new Date(a.publishDate).getTime();
        //             const dateB = new Date(b.publishDate).getTime();
        //             return dateB - dateA; // Sắp xếp giảm dần theo ngày đăng
        //         });
        //     setBaivietList(activeBaiviets);
        // } else {
        //     Swal.fire("Thông báo", "Không có bài viết nào", "info");
        // }
      } catch (error) {
        Swal.fire("Lỗi", "Không thể tải bài viết", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = baivietList.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(baivietList.length / postsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (baivietList.length === 0) {
    return <div className="text-center mt-5">Không có bài viết hiển thị</div>;
  }

  return (
    <>
      <div className="">

        <div className="row container-fluid">
          <div className="col-8 " style={{ paddingRight: "0px", border: "1px solid gray" }}>
            {/* header */}
            <div className="navbar-baiviet  bg-succes" >
              <p style={{ color: "gray", margin: "10px 30px 20px 50px" }}><span>Trang chủ</span> / <span>Giới Thiệu về chúng tôi</span></p>
              <div className="content_baiviet">
                <h1 className="text-center" style={{ fontSize: "30px", textTransform: "uppercase", marginBottom: "40px" }}>Giới Thiệu về Beautiful-Fashsion</h1>
                <div className="image_baiviet_header">
                  <img src="../../public/image/baiviet 1.jpg" alt="" style={{ width: "400px" }} />
                  <img src="../../public/image/baiviet2.jpg" alt="" style={{ width: "400px" }} />
                  <img src="../../public/image/icon.jpg" alt="" />
                </div>
                <p style={{ margin: "20px 50px 20px 50px", fontSize: "16px", lineHeight: "1.6", textIndent: "20px", textAlign: "justify" }}>Chào mừng bạn đến với Beautiful-Fashion! Chúng tôi tự hào là một trong những cửa hàng thời trang hàng đầu, chuyên cung cấp những bộ trang phục không chỉ đẹp mắt mà còn chất lượng. Với sứ mệnh mang đến cho bạn những sản phẩm thời trang phù hợp với mọi phong cách và dịp lễ, chúng tôi cam kết đem lại cho bạn một trải nghiệm mua sắm tuyệt vời. Tại Beautiful-Fashion, mỗi sản phẩm đều được thiết kế tỉ mỉ, nhằm đáp ứng nhu cầu đa dạng của khách hàng. Thời trang không chỉ là trang phục mà còn là sự tự tin và phong cách cá nhân của bạn. Đến với chúng tôi, bạn sẽ tìm thấy những bộ trang phục giúp bạn tỏa sáng trong mọi hoàn cảnh.
                  Chúng tôi không ngừng nỗ lực để cải thiện và phát triển, mang đến cho bạn những sản phẩm mới nhất và chất lượng nhất. Với một đội ngũ thiết kế sáng tạo và tận tâm, chúng tôi luôn theo dõi những xu hướng mới nhất để mang đến cho bạn những bộ sưu tập hấp dẫn và hiện đại. Beautiful-Fashion không chỉ là một cửa hàng, mà là một phần trong hành trình khám phá phong cách của bạn.
                </p>
                <img src="../../public/image/baiviet3.jpg" alt="" style={{ width: "400px", margin: "10px 0px 20px 280px " }} />
                <p style={{ margin: "20px 50px 20px 50px", fontSize: "16px", lineHeight: "1.6", textIndent: "20px", textAlign: "justify" }}>
                  Tại Beautiful-Fashion, bạn sẽ tìm thấy một bộ sưu tập phong phú, từ những chiếc áo thun năng động, váy xinh xắn cho đến quần jeans cá tính và những bộ đồ công sở thanh lịch. Chúng tôi không ngừng cập nhật những mẫu mã mới nhất để bạn luôn có thể lựa chọn những sản phẩm thời thượng và phù hợp với xu hướng hiện đại. Mỗi sản phẩm đều được chăm chút từ kiểu dáng, màu sắc đến chất liệu, nhằm mang lại cho bạn sự thoải mái và phong cách.
                  Chúng tôi hiểu rằng mỗi khách hàng đều có những sở thích và phong cách riêng, vì vậy chúng tôi cung cấp nhiều lựa chọn để bạn có thể tìm thấy những gì phù hợp nhất với mình. Nếu bạn đang tìm kiếm sự thanh lịch cho một buổi tiệc hay sự trẻ trung cho những buổi dạo phố, Beautiful-Fashion đều có những lựa chọn hoàn hảo cho bạn. Chúng tôi cũng cung cấp các bộ sưu tập theo mùa, giúp bạn luôn nổi bật và sành điệu trong mọi dịp.
                </p>
                <img src="../../public/image/baiviet4.jpg" alt="" style={{ width: "400px", margin: "10px 0px 20px 280px " }} />
                <p style={{ margin: "20px 50px 20px 50px", fontSize: "16px", lineHeight: "1.6", textIndent: "20px", textAlign: "justify" }}>
                  Chất lượng sản phẩm là tiêu chí mà chúng tôi đặt lên hàng đầu. Tất cả các sản phẩm tại Beautiful-Fashion đều được làm từ những chất liệu cao cấp, đảm bảo độ bền và sự thoải mái khi mặc. Chúng tôi chọn lọc kỹ lưỡng từng nguyên liệu để đảm bảo rằng mỗi sản phẩm không chỉ đẹp mà còn an toàn cho sức khỏe người tiêu dùng. Bên cạnh đó, quy trình sản xuất của chúng tôi tuân thủ các tiêu chuẩn nghiêm ngặt, nhằm đảm bảo rằng bạn sẽ nhận được những bộ trang phục hoàn hảo nhất.
                  Chúng tôi tin rằng một sản phẩm tốt không chỉ đến từ thiết kế đẹp mà còn phải đáp ứng được nhu cầu sử dụng hàng ngày của bạn. Vì vậy, chúng tôi đã đầu tư công nghệ sản xuất hiện đại và quy trình kiểm tra chất lượng nghiêm ngặt, để mỗi sản phẩm đến tay khách hàng đều đạt tiêu chuẩn cao nhất. Đến với Beautiful-Fashion, bạn không chỉ đơn thuần mua sắm mà còn trải nghiệm sự khác biệt trong từng sản phẩm.
                </p>
                <img src="../../public/image/baiviet5.jpeg" alt="" style={{ width: "600px", margin: "10px 0px 20px 200px " }} />
                <p style={{ margin: "20px 50px 20px 50px", fontSize: "16px", lineHeight: "1.6", textIndent: "20px", textAlign: "justify" }}>
                  Chúng tôi luôn mong muốn mang lại cho bạn những trải nghiệm mua sắm thú vị và đáng nhớ. Hãy theo dõi Beautiful-Fashion để không bỏ lỡ các chương trình khuyến mãi hấp dẫn và sự kiện đặc biệt diễn ra thường xuyên. Từ giảm giá theo mùa, chương trình tri ân khách hàng đến các buổi ra mắt sản phẩm mới, chúng tôi luôn có những ưu đãi tuyệt vời dành cho bạn.
                  Ngoài ra, chúng tôi cũng tổ chức nhiều sự kiện thú vị như buổi trình diễn thời trang, workshop về phong cách và nhiều hoạt động tương tác khác. Những trải nghiệm này không chỉ giúp bạn tìm ra phong cách riêng mà còn tạo ra những kỷ niệm đáng nhớ. Tại Beautiful-Fashion, chúng tôi không chỉ muốn bạn mua sắm mà còn muốn bạn cảm nhận được niềm vui và sự hào hứng trong từng khoảnh khắc.
                </p>
              </div>
            </div>
          </div>
          <div className="col-4 " style={{ paddingLeft: "0px" }}>
            <h2 className="" style={{ fontSize: "20px", textTransform: "uppercase", margin: "20px 0px 10px 10px" }}>Bài Viết Nổi Bật </h2>
            <div className="row " style={{paddingLeft:"20px"}}>

              {currentPosts.slice(0,6).map((baiviet) => {
                const publishDate = new Date(baiviet.publishDate);
                const day = publishDate.getDate().toString().padStart(2, "0");
                const month = publishDate.toLocaleString("en", { month: "short" });
                return (
                  <div className="col-5" style={{width:"230px",padding:"10px 10px"}} key={baiviet.id}>
                    <div className="card ">
                      <img src={baiviet.images} className="card-img-top" alt="..." style={{ height: "200px", objectFit: "cover" }} />
                      <div className="card-body">
                        <Link to={`/baiviet/${baiviet.id}`} className="nav-link">
                        <h5 className="card-title_baiviet fw-semibold" title={baiviet.title}>{baiviet.title}</h5></Link>
                        <div
                          className="card-text text_baiViet"
                          dangerouslySetInnerHTML={{ __html: baiviet.titleHeader }}
                        />
                        <p className="card-text">
                          <small className="text-muted">
                            {/* {day} {month} */}
                            24/5/2025
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default BaivietPage;
{/* Phân trang */ }
//  <div className="d-flex justify-content-center mt-4">
//  <Stack spacing={2}>
//    <Pagination
//      count={totalPages}
//      page={currentPage}
//      onChange={handlePageChange}
//      color="primary"
//      size="large"
//      siblingCount={1}
//      boundaryCount={1}
//    />
//  </Stack>
// </div>