package com.mzhl.websocket;

import com.mzhl.constant.JwtClaimsConstant;
import com.mzhl.properties.JwtProperties;
import com.mzhl.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.websocket.CloseReason;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket服务
 */
@Component
@Slf4j
@ServerEndpoint("/ws/{sid}")
public class WebSocketServer {

    //存放会话对象（单实例部署；多实例需引入Redis/MQ广播，此处仅保证线程安全）
    private static Map<String, Session> sessionMap = new ConcurrentHashMap<>();

    //WS端点由容器实例化，@Autowired字段注入无效，改用static + setter注入
    private static JwtProperties jwtProperties;

    @Autowired
    public void setJwtProperties(JwtProperties jwtProperties) {
        WebSocketServer.jwtProperties = jwtProperties;
    }

    /**
     * 连接建立成功调用的方法
     * 鉴权：必须携带有效的管理端JWT（query参数token），否则直接关闭连接
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("sid") String sid) {
        Map<String, List<String>> params = session.getRequestParameterMap();
        List<String> tokenList = params.get("token");
        String token = (tokenList == null || tokenList.isEmpty()) ? null : tokenList.get(0);

        try {
            Claims claims = JwtUtil.parseJWT(jwtProperties.getAdminSecretKey(), token);
            Long empId = Long.valueOf(claims.get(JwtClaimsConstant.EMP_ID).toString());
            log.info("管理端员工 {} WebSocket建立连接，sid: {}", empId, sid);

            //同一sid重复连接时关闭旧会话，避免泄漏
            Session old = sessionMap.put(sid, session);
            if (old != null && old.isOpen()) {
                old.close(new CloseReason(CloseReason.CloseCodes.VIOLATED_POLICY, "replaced by new connection"));
            }
        } catch (Exception e) {
            log.warn("WebSocket未授权连接被拒绝，sid: {}", sid);
            try {
                session.close(new CloseReason(CloseReason.CloseCodes.VIOLATED_POLICY, "unauthorized"));
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, @PathParam("sid") String sid) {
        log.debug("收到来自客户端：{}的信息: {}", sid, message);
    }

    /**
     * 连接关闭调用的方法
     *
     * @param sid
     */
    @OnClose
    public void onClose(@PathParam("sid") String sid) {
        log.info("连接断开: {}", sid);
        sessionMap.remove(sid);
    }

    /**
     * 群发
     *
     * @param message
     */
    public void sendToAllClient(String message) {
        Collection<Session> sessions = sessionMap.values();
        for (Session session : sessions) {
            //跳过已关闭的连接
            if (!session.isOpen()) {
                continue;
            }
            try {
                //服务器向客户端发送消息
                session.getBasicRemote().sendText(message);
            } catch (Exception e) {
                log.warn("WebSocket发送失败，sid: {}", session.getId(), e);
            }
        }
    }

}
